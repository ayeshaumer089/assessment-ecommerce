import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('sales')
  getSalesData(@Query('period') period?: string) {
    return this.dashboardService.getSalesData(period);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: number) {
    return this.dashboardService.getTopProducts(limit);
  }

  @Get('order-status')
  getOrderStatusBreakdown() {
    return this.dashboardService.getOrderStatusBreakdown();
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentOrders(limit);
  }
}
