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
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

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

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
  ) {}

  // ── Checkout ─────────────────────────────────────────────────────────────────

  async checkout(
    userId: string,
    _dto: CheckoutDto,
  ): Promise<{ order: OrderDocument; payment: MockPaymentResult }> {
    // Read the raw cart (no populate needed — we re-fetch each product for fresh data)
    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // Validate stock for every item and build order lines from live DB prices
    const orderItems: Array<{
      productId: Types.ObjectId;
      name: string;
      quantity: number;
      price: number;
    }> = [];
    let runningTotal = 0;

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

      runningTotal += product.price * cartItem.quantity;

      orderItems.push({
        productId: cartItem.productId,
        name: product.name,
        quantity: cartItem.quantity,
        price: product.price, // always use current DB price, not the cart snapshot
      });
    }

    const totalAmount = parseFloat(runningTotal.toFixed(2));

    // Mock payment gateway — always succeeds
    const payment = this.mockPayment(totalAmount);

    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID,
    });

    // Persist the order before clearing the cart so a crash doesn't lose the order
    await order.save();
    await this.cartService.clearCart(userId);

    return { order, payment };
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
    return order.save();
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
      order.status = dto.status;
    }

    if (dto.paymentStatus) {
      order.paymentStatus = dto.paymentStatus;
    }

    return order.save();
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
