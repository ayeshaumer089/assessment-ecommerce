import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// ── Embedded sub-document ─────────────────────────────────────────────────────
@Schema({ _id: false })
class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({
    required: true,
    min: [1, 'Quantity must be at least 1'],
  })
  quantity: number;

  @Prop({
    required: true,
    min: [0, 'Price cannot be negative'],
  })
  price: number; // snapshot of price at the time of adding to cart
}

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true, collection: 'carts' })
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// ── Indexes ──────────────────────────────────────────────────────────────────
CartSchema.index({ userId: 1 }, { unique: true });

// ── Virtuals ─────────────────────────────────────────────────────────────────
CartSchema.virtual('totalItems').get(function (this: CartDocument) {
  return (this.items as any[]).reduce((sum, item) => sum + item.quantity, 0);
});

CartSchema.virtual('totalPrice').get(function (this: CartDocument) {
  return parseFloat(
    (this.items as any[])
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2),
  );
});

CartSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
