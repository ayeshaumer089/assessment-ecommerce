import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type Stripe from 'stripe';
import { Order, OrderDocument } from './schemas/order.schema';
import { StripeService } from '../stripe/stripe.service';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { calculateShipping } from '../common/constants/shipping';

// Defines which transitions are legal from each status.
// Terminal statuses (delivered, cancelled) have empty arrays.
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export interface MockPaymentResult {
  success: boolean;
  transactionId: string;
  method: string;
  amount: number;
  processedAt: string;
  /** Present only for Stripe-settled orders. */
  provider?: string;
  card?: OrderCardDetails;
  receiptUrl?: string;
}

export interface OrderCardDetails {
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  receiptUrl?: string;
}

export interface OrderLine {
  productId: Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

/**
 * Server-priced snapshot of a cart. Produced once and reused by both the
 * PaymentIntent (how much to charge) and the Order (what was bought), so the
 * two can never drift apart.
 */
export interface OrderDraft {
  items: OrderLine[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}

/** Everything needed to record an already-settled payment as an order. */
export interface PaidOrderInput {
  userId: string;
  draft: OrderDraft;
  paymentIntentId: string;
  shippingAddress?: Record<string, any> | null;
  paymentMethod?: string;
  card?: OrderCardDetails | null;
}

type StockChange = { productId: Types.ObjectId; quantity: number };

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly stripeService: StripeService,
  ) {}

  // ── Pricing ──────────────────────────────────────────────────────────────────

  /**
   * Prices the user's cart from live product data — the single source of truth
   * for "what does this order cost". Called once to size the PaymentIntent and
   * again at fulfilment, so a tampered client can never change the amount.
   *
   * @param strictStock when true, throws if any line exceeds available stock.
   */
  async buildOrderDraft(userId: string, strictStock = true): Promise<OrderDraft> {
    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const items: OrderLine[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await this.productsService.findOne(
        cartItem.productId.toString(),
      );

      if (strictStock && product.stock < cartItem.quantity) {
        throw new BadRequestException(
          `"${product.name}" only has ${product.stock} unit(s) in stock. ` +
            `Update your cart before checking out.`,
        );
      }

      subtotal += product.price * cartItem.quantity;
      items.push({
        productId: cartItem.productId,
        name: product.name,
        image: product.image,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    subtotal = round(subtotal);
    const shippingCost = calculateShipping(subtotal);

    return {
      items,
      subtotal,
      shippingCost,
      totalAmount: round(subtotal + shippingCost),
    };
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────

  async checkout(
    userId: string,
    dto: CheckoutDto,
  ): Promise<{ order: OrderDocument; payment: MockPaymentResult }> {
    // Stripe path — the browser already confirmed a PaymentIntent.
    if (dto.paymentIntentId) {
      return this.checkoutWithStripe(userId, dto, dto.paymentIntentId);
    }

    // ── Legacy simulated path (unchanged) ─────────────────────────────────────
    const draft = await this.buildOrderDraft(userId);
    const { items: orderItems, subtotal, shippingCost, totalAmount } = draft;

    // Reserve stock atomically — protects against overselling under concurrency.
    await this.decrementStock(orderItems);

    // Mock payment gateway — always succeeds in this assessment build.
    const payment = this.mockPayment(totalAmount);

    try {
      const order = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: orderItems,
        subtotal,
        shippingCost,
        totalAmount,
        shippingAddress: dto.shippingAddress,
        paymentMethod: dto.paymentMethod || 'Card (mock)',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PAID,
      });

      // Persist the order before clearing the cart so a crash doesn't lose it.
      await order.save();
      await this.cartService.clearCart(userId);

      return { order, payment };
    } catch (err) {
      // Order failed to persist — release the stock we just reserved.
      await this.restoreStock(orderItems);
      throw err;
    }
  }

  /**
   * Fulfils an order against a PaymentIntent the browser has already confirmed.
   *
   * The intent is re-fetched from Stripe rather than trusted from the request:
   * a client can send any id, so ownership, status and amount are all verified
   * server-side before a single unit of stock moves.
   */
  private async checkoutWithStripe(
    userId: string,
    dto: CheckoutDto,
    paymentIntentId: string,
  ): Promise<{ order: OrderDocument; payment: MockPaymentResult }> {
    const intent = await this.retrievePaymentIntent(paymentIntentId);

    if (intent.metadata?.userId !== userId) {
      throw new ForbiddenException('This payment does not belong to you');
    }

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(
        `Payment has not completed (status: ${intent.status}). Please try again.`,
      );
    }

    // Already fulfilled — most likely the webhook won the race, or the customer
    // refreshed. Return the existing order instead of charging/creating twice.
    const existing = await this.orderModel.findOne({ paymentIntentId }).exec();
    if (existing) {
      return {
        order: existing,
        payment: this.toPaymentResult(existing, intent),
      };
    }

    // Price the cart again and check it still matches what Stripe collected.
    // A mismatch means the cart changed after the intent was sized.
    const draft = await this.buildOrderDraft(userId, false);
    const paidAmount = StripeService.fromMinorUnits(
      intent.amount_received || intent.amount,
    );

    if (Math.abs(draft.totalAmount - paidAmount) > 0.009) {
      this.logger.warn(
        `Cart total (${draft.totalAmount}) differs from the amount paid ` +
          `(${paidAmount}) for intent ${paymentIntentId}. Fulfilling the ` +
          `amount actually charged.`,
      );
      // The customer was charged `paidAmount` — that is the binding figure.
      draft.totalAmount = paidAmount;
      draft.subtotal = round(paidAmount - draft.shippingCost);
    }

    const card = this.extractCardDetails(intent);

    const order = await this.createPaidOrder({
      userId,
      draft,
      paymentIntentId,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod || formatPaymentMethod(card),
      card,
    });

    return { order, payment: this.toPaymentResult(order, intent) };
  }

  /**
   * Records an already-settled payment as an order. Idempotent on
   * `paymentIntentId`, so the browser and the Stripe webhook can both call it
   * concurrently and exactly one order results.
   *
   * Stock is reserved best-effort here: the money has already moved, so
   * refusing to create the order would strand a real charge. Shortfalls are
   * logged for an admin to resolve rather than thrown at the customer.
   */
  async createPaidOrder(input: PaidOrderInput): Promise<OrderDocument> {
    const { userId, draft, paymentIntentId, card } = input;

    const existing = await this.orderModel.findOne({ paymentIntentId }).exec();
    if (existing) return existing;

    const shortfalls = await this.reserveStockBestEffort(draft.items);
    if (shortfalls.length) {
      this.logger.warn(
        `Order for intent ${paymentIntentId} oversold: ` +
          shortfalls.map((s) => `${s.name} (short ${s.short})`).join(', '),
      );
    }

    try {
      const order = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: draft.items,
        subtotal: draft.subtotal,
        shippingCost: draft.shippingCost,
        totalAmount: draft.totalAmount,
        shippingAddress: input.shippingAddress ?? undefined,
        paymentMethod: input.paymentMethod || formatPaymentMethod(card),
        paymentProvider: 'stripe',
        paymentIntentId,
        paymentDetails: card ?? undefined,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PAID,
      });

      await order.save();
      await this.cartService.clearCart(userId);
      return order;
    } catch (err: any) {
      // Duplicate key = the other caller won the race. Return their order.
      if (err?.code === 11000) {
        await this.restoreStock(draft.items);
        const winner = await this.orderModel.findOne({ paymentIntentId }).exec();
        if (winner) return winner;
      }
      await this.restoreStock(draft.items);
      throw err;
    }
  }

  /** Looks up an order by the Stripe intent that paid for it. */
  async findByPaymentIntent(
    paymentIntentId: string,
  ): Promise<OrderDocument | null> {
    return this.orderModel.findOne({ paymentIntentId }).exec();
  }

  /** Flips an order's payment status — used by webhook refund handling. */
  async markPaymentStatus(
    orderId: Types.ObjectId | string,
    paymentStatus: PaymentStatus,
  ): Promise<void> {
    await this.orderModel
      .updateOne({ _id: orderId }, { $set: { paymentStatus } })
      .exec();
  }

  // ── Customer ─────────────────────────────────────────────────────────────────

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    // Customers may only read their own orders
    if (userId && order.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async cancel(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.findOne(id, userId);

    const cancellable: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
    ];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel an order with status "${order.status}"`,
      );
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await order.save();
    // Return reserved units to inventory.
    await this.restoreStock(order.items as unknown as StockChange[]);
    return saved;
  }

  // ── Admin ─────────────────────────────────────────────────────────────────────

  async findAll(): Promise<{ data: OrderDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.orderModel.find().sort({ createdAt: -1 }).exec(),
      this.orderModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async updateStatus(id: string, dto: UpdateOrderDto): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    if (dto.status) {
      const allowed = STATUS_TRANSITIONS[order.status];
      if (!allowed.includes(dto.status)) {
        const hint = allowed.length
          ? `Allowed next status: ${allowed.join(', ')}`
          : `"${order.status}" is a terminal status — no further transitions allowed`;
        throw new BadRequestException(
          `Cannot transition from "${order.status}" to "${dto.status}". ${hint}`,
        );
      }

      const isCancelling = dto.status === OrderStatus.CANCELLED;
      order.status = dto.status;
      if (dto.paymentStatus) order.paymentStatus = dto.paymentStatus;
      const saved = await order.save();

      // Admin-driven cancellation also returns stock to inventory.
      if (isCancelling) {
        await this.restoreStock(order.items as unknown as StockChange[]);
      }
      return saved;
    }

    if (dto.paymentStatus) {
      order.paymentStatus = dto.paymentStatus;
    }

    return order.save();
  }

  // ── Stock helpers ─────────────────────────────────────────────────────────────

  /**
   * Atomically decrements stock for each line item. The conditional filter
   * (`stock >= quantity`) makes each update safe under concurrency — if any
   * item lacks stock, all previously-applied decrements are rolled back.
   */
  private async decrementStock(items: StockChange[]): Promise<void> {
    const applied: StockChange[] = [];

    for (const item of items) {
      const updated = await this.productModel
        .findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        )
        .exec();

      if (!updated) {
        await this.restoreStock(applied);
        throw new BadRequestException(
          'Insufficient stock for one or more items. Please review your cart.',
        );
      }
      applied.push({ productId: item.productId, quantity: item.quantity });
    }
  }

  /**
   * Reserves what it can and reports what it couldn't, instead of throwing.
   * Used only on the paid path — see `createPaidOrder` for why.
   */
  private async reserveStockBestEffort(
    items: OrderLine[],
  ): Promise<Array<{ name: string; short: number }>> {
    const shortfalls: Array<{ name: string; short: number }> = [];

    for (const item of items) {
      const updated = await this.productModel
        .findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        )
        .exec();

      if (!updated) {
        // Take whatever remains and floor the product at zero.
        const product = await this.productModel
          .findOneAndUpdate(
            { _id: item.productId },
            [{ $set: { stock: { $max: [0, { $subtract: ['$stock', item.quantity] }] } } }],
          )
          .exec();
        shortfalls.push({
          name: item.name,
          short: item.quantity - (product?.stock ?? 0),
        });
      }
    }

    return shortfalls;
  }

  /** Returns reserved units to inventory (used on cancel / rollback). */
  private async restoreStock(items: StockChange[]): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.productModel
          .updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
          )
          .exec(),
      ),
    );
  }

  // ── Stripe helpers ───────────────────────────────────────────────────────────

  /** Fetches the intent with the card + charge data expanded in one round-trip. */
  private async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripeService.client.paymentIntents.retrieve(
        paymentIntentId,
        { expand: ['payment_method', 'latest_charge'] },
      );
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.code === 'resource_missing') {
        throw new NotFoundException('Payment not found');
      }
      throw new BadRequestException(
        err?.message || 'Unable to verify the payment with Stripe',
      );
    }
  }

  /** Pulls the PCI-safe card fields (brand, last4, expiry) off an intent. */
  private extractCardDetails(
    intent: Stripe.PaymentIntent,
  ): OrderCardDetails | null {
    const method = intent.payment_method;
    const card =
      method && typeof method !== 'string' ? (method as any).card : null;

    const charge = intent.latest_charge;
    const receiptUrl =
      charge && typeof charge !== 'string'
        ? (charge as Stripe.Charge).receipt_url || undefined
        : undefined;

    if (!card) return receiptUrl ? { receiptUrl } : null;

    return {
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      receiptUrl,
    };
  }

  /** Shapes a settled order into the `{ order, payment }` contract the UI expects. */
  private toPaymentResult(
    order: OrderDocument,
    intent: Stripe.PaymentIntent,
  ): MockPaymentResult {
    const card = order.paymentDetails ?? this.extractCardDetails(intent);
    return {
      success: intent.status === 'succeeded',
      transactionId: intent.id,
      method: 'stripe_card',
      amount: order.totalAmount,
      processedAt: new Date(intent.created * 1000).toISOString(),
      provider: 'stripe',
      card: card ?? undefined,
      receiptUrl: card?.receiptUrl,
    };
  }

  // ── Mock payment ─────────────────────────────────────────────────────────────

  private mockPayment(amount: number): MockPaymentResult {
    const suffix = Math.random().toString(36).slice(2, 9).toUpperCase();
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${suffix}`,
      method: 'mock_card',
      amount,
      processedAt: new Date().toISOString(),
    };
  }
}

function round(n: number, decimals = 2): number {
  return parseFloat(n.toFixed(decimals));
}

/** "Visa •••• 4242" — the label shown on the order + success screens. */
function formatPaymentMethod(card?: OrderCardDetails | null): string {
  if (!card?.last4) return 'Card';
  const brand = card.brand
    ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
    : 'Card';
  return `${brand} •••• ${card.last4}`;
}
