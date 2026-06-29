import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({
    required: true,
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  })
  name: string;

  @Prop({
    required: true,
    minlength: [10, 'Description must be at least 10 characters'],
  })
  description: string;

  @Prop({
    required: true,
    min: [0, 'Price cannot be negative'],
  })
  price: number;

  @Prop({
    required: true,
  })
  image: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  category: string;

  @Prop({
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ── Indexes ──────────────────────────────────────────────────────────────────
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });

// ── Virtual: discounted price helper ─────────────────────────────────────────
ProductSchema.virtual('inStock').get(function (this: ProductDocument) {
  return this.stock > 0;
});

ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString();
    delete ret.__v;
    return ret;
  },
});

// Ensure lean() queries also get string IDs by using a post-find hook
ProductSchema.post(['find', 'findOne'], function(docs) {
  if (!docs) return;
  const items = Array.isArray(docs) ? docs : [docs];
  for (const doc of items) {
    if (doc && doc._id && typeof doc._id !== 'string') {
      doc.id = doc._id.toString();
      doc._id = doc._id.toString();
    }
  }
});
