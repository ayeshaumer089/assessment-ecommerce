import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Role } from '../users/enums/role.enum';
import { Types } from 'mongoose';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Customer routes ──────────────────────────────────────────────────────────

  @Get()
  findMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findByUser(user.id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.id, dto);
  }

  // Static 'all' must be declared before :id so NestJS matches it first
  @Get('all')
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: any,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.ordersService.findOne(id.toString(), user.id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @CurrentUser() user: any,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.ordersService.cancel(id.toString(), user.id);
  }

  // ── Admin routes ──────────────────────────────────────────────────────────────

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id.toString(), dto);
  }
}
