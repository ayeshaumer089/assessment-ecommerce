import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  addItem(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch(':productId')
  updateItem(
    @CurrentUser() user: any,
    @Param('productId', ParseObjectIdPipe) productId: Types.ObjectId,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, productId.toString(), dto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  removeItem(
    @CurrentUser() user: any,
    @Param('productId', ParseObjectIdPipe) productId: Types.ObjectId,
  ) {
    return this.cartService.removeItem(user.id, productId.toString());
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
