import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}

  // ── Read ────────────────────────────────────────────────────────────────────

  async getCart(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId', 'name price image category stock')
      .exec();

    // Return a consistent empty-cart shape when the user has no cart yet.
    // We do NOT persist it — the cart is created on first addItem.
    if (!cart) {
      return new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    return cart;
  }

  // ── Add / increment ─────────────────────────────────────────────────────────

  async addItem(userId: string, dto: AddToCartDto): Promise<CartDocument> {
    const { productId, quantity } = dto;

    const product = await this.productsService.findOne(productId);

    // Find or lazily create the cart document
    let cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) {
      cart = new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    const existing = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existing) {
      const combined = existing.quantity + quantity;
      if (product.stock < combined) {
        throw new BadRequestException(
          `Only ${product.stock} unit(s) in stock (${existing.quantity} already in your cart).`,
        );
      }
      existing.quantity = combined;
    } else {
      if (product.stock < quantity) {
        throw new BadRequestException(
          `Only ${product.stock} unit(s) in stock.`,
        );
      }
      (cart.items as any[]).push({
        productId: new Types.ObjectId(productId),
        quantity,
        price: product.price, // price snapshot — locked at the moment of adding
      });
    }

    cart.markModified('items');
    const saved = await cart.save();
    return saved.populate('items.productId', 'name price image category stock');
  }

  // ── Update quantity ─────────────────────────────────────────────────────────

  async updateItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    // quantity === 0 → treat as remove
    if (dto.quantity === 0) {
      return this.removeItem(userId, productId);
    }

    const cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(
      (i) => i.productId.toString() === productId,
    );
    if (!item) throw new NotFoundException('Item not found in cart');

    const product = await this.productsService.findOne(productId);
    if (product.stock < dto.quantity) {
      throw new BadRequestException(
        `Only ${product.stock} unit(s) in stock.`,
      );
    }

    item.quantity = dto.quantity;
    cart.markModified('items');
    const saved = await cart.save();
    return saved.populate('items.productId', 'name price image category stock');
  }

  // ── Remove one item ─────────────────────────────────────────────────────────

  async removeItem(userId: string, productId: string): Promise<CartDocument> {
    const cart = await this.cartModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $pull: { items: { productId: new Types.ObjectId(productId) } } },
        { new: true },
      )
      .populate('items.productId', 'name price image category stock')
      .exec();

    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  // ── Clear entire cart ───────────────────────────────────────────────────────

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { items: [] } },
    );
  }
}
