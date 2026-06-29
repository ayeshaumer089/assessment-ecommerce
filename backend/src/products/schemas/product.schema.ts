import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true, maxlength: 200 })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0, max: 100, default: 0 })
  discountPercentage: number;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ trim: true })
  brand?: string;

  @Prop({ trim: true, uppercase: true })
  sku?: string;

  @Prop([String])
  tags: string[];

  @Prop({ required: true })
  thumbnail: string;

  @Prop([String])
  images: string[];

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0, min: 0 })
  reviewCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
// Compound indexes for common queries
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });

ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
