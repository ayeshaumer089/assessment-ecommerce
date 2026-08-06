import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Line-item snapshot taken when the PaymentIntent was created. The webhook
 * handler uses this to rebuild the order if the browser never made it back
 * (tab closed, network dropped) after a successful charge.
 */
@Schema({ _id: false })
class PaymentLineItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;
}

@Schema({ _id: false })
class PaymentCardDetails {
  @Prop({ trim: true })
  brand?: string;

  @Prop({ trim: true })
  last4?: string;

  @Prop()
  expMonth?: number;

  @Prop()
  expYear?: number;
}

export type PaymentDocument = HydratedDocument<Payment>;

/**
 * Local mirror of a Stripe PaymentIntent.
 *
 * Stripe remains the source of truth for money; this collection exists so the
 * app can answer "was this paid?" without a network round-trip, and so the
 * webhook handler has an idempotency anchor.
 */
@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ required: true, trim: true, unique: true, index: true })
  paymentIntentId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null, index: true })
  orderId?: Types.ObjectId | null;

  /** Amount in the currency's major unit (dollars), matching Order.totalAmount. */
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, trim: true, lowercase: true })
  currency: string;

  /** Raw Stripe PaymentIntent status — kept verbatim, not remapped. */
  @Prop({ required: true, trim: true, index: true })
  status: string;

  @Prop({ type: [PaymentLineItem], default: [] })
  items: PaymentLineItem[];

  @Prop({ required: true, min: 0, default: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  shippingCost: number;

  /** Address captured at step 1 of checkout, used by the webhook fallback. */
  @Prop({ type: Object, default: null })
  shippingAddress?: Record<string, any> | null;

  @Prop({ type: PaymentCardDetails, default: null })
  card?: PaymentCardDetails | null;

  @Prop({ trim: true })
  receiptUrl?: string;

  @Prop({ trim: true })
  failureMessage?: string;

  /** Set once refunded through Stripe (dashboard or API). */
  @Prop({ min: 0, default: 0 })
  amountRefunded: number;

  /**
   * Guards against replaying an out-of-order or duplicate webhook: Stripe
   * delivers at-least-once and does not guarantee ordering.
   */
  @Prop({ type: [String], default: [] })
  processedEventIds: string[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Supports "find this user's reusable open intent" on the checkout hot path.
PaymentSchema.index({ userId: 1, status: 1, createdAt: -1 });

PaymentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.processedEventIds;
    return ret;
  },
});
