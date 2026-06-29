import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
  ) {}

  async getCart(_userId: string): Promise<CartDocument | null> {
    // TODO: populate product details
    return null;
  }

  async addItem(_userId: string, _dto: AddToCartDto): Promise<CartDocument> {
    // TODO: validate product exists and has stock, upsert cart
    throw new Error('Not implemented');
  }

  async updateItem(
    _userId: string,
    _productId: string,
    _dto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    // TODO: update quantity or remove if 0
    throw new Error('Not implemented');
  }

  async removeItem(_userId: string, _productId: string): Promise<CartDocument> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async clearCart(_userId: string): Promise<void> {
    // TODO: implement
  }
}
