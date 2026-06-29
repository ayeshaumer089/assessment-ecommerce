import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { QueryProductDto } from '../products/dto/query-product.dto';
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Role } from '../users/enums/role.enum';
import { Types } from 'mongoose';

// Every route in this controller is admin-only.
// The global RolesGuard enforces this — customers receive 403 on every path.
@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  // ── Dashboard stats ──────────────────────────────────────────────────────────

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ── Product management ───────────────────────────────────────────────────────

  @Get('products')
  listProducts(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get('products/:id')
  getProduct(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.productsService.findOne(id.toString());
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id.toString(), dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.productsService.remove(id.toString());
  }

  // ── Order management ─────────────────────────────────────────────────────────

  @Get('orders')
  listOrders() {
    return this.ordersService.findAll();
  }

  @Get('orders/:id')
  getOrder(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    // No userId passed → admin bypass of ownership check
    return this.ordersService.findOne(id.toString());
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id.toString(), dto);
  }
}
