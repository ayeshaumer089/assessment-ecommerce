import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Role } from '../users/enums/role.enum';
import { Types } from 'mongoose';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findByUser(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
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

  // ── Admin-only ──────────────────────────────────────────────────────────────

  @Get('admin/all')
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch('admin/:id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id.toString(), dto);
  }
}
