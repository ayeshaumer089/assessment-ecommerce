import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
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
}

type StockChange = { productId: Types.ObjectId; quantity: number };

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
  ) {}

  // ── Checkout ─────────────────────────────────────────────────────────────────

  async checkout(
    userId: string,
    dto: CheckoutDto,
  ): Promise<{ order: OrderDocument; payment: MockPaymentResult }> {
    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // Build order lines from the live DB price (never trust the cart snapshot).
    const orderItems: Array<{
      productId: Types.ObjectId;
      name: string;
      image?: string;
      quantity: number;
      price: number;
    }> = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await this.productsService.findOne(
        cartItem.productId.toString(),
      );

      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(
          `"${product.name}" only has ${product.stock} unit(s) in stock. ` +
            `Update your cart before checking out.`,
        );
      }

      subtotal += product.price * cartItem.quantity;
      orderItems.push({
        productId: cartItem.productId,
        name: product.name,
        image: product.image,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    subtotal = round(subtotal);
    const shippingCost = calculateShipping(subtotal);
    const totalAmount = round(subtotal + shippingCost);

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
