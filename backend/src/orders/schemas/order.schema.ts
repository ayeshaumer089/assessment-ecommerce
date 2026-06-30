import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

// ── Embedded sub-document ─────────────────────────────────────────────────────
@Schema({ _id: false })
class OrderItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({ trim: true })
  image?: string; // snapshot of the product image at order time

  @Prop({
    required: true,
    min: [1, 'Quantity must be at least 1'],
  })
  quantity: number;

  @Prop({
    required: true,
    min: [0, 'Price cannot be negative'],
  })
  price: number; // snapshot of price at order time
}

// ── Embedded shipping address ─────────────────────────────────────────────────
@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ trim: true })
  apt?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  zipCode: string;

  @Prop({ required: true, trim: true })
  country: string;
}

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: [OrderItem],
    required: true,
    validate: {
      validator: (items: any[]) => items.length > 0,
      message: 'Order must contain at least one item',
    },
  })
  items: OrderItem[];

  @Prop({
    required: true,
    min: [0, 'Subtotal cannot be negative'],
    default: 0,
  })
  subtotal: number;

  @Prop({
    required: true,
    min: [0, 'Shipping cost cannot be negative'],
    default: 0,
  })
  shippingCost: number;

  @Prop({
    required: true,
    min: [0, 'Total amount cannot be negative'],
  })
  totalAmount: number;

  @Prop({ type: ShippingAddress })
  shippingAddress?: ShippingAddress;

  @Prop({ trim: true, default: 'Card (mock)' })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(OrderStatus),
      message: 'Invalid order status',
    },
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({
    type: String,
    enum: {
      values: Object.values(PaymentStatus),
      message: 'Invalid payment status',
    },
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// ── Indexes ──────────────────────────────────────────────────────────────────
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// ── Virtual: item count ───────────────────────────────────────────────────────
OrderSchema.virtual('itemCount').get(function (this: OrderDocument) {
  return (this.items as any[]).reduce((sum, item) => sum + item.quantity, 0);
});

OrderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
