import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

// Admin-only: global RolesGuard enforces this on every route.
@Controller('dashboard')
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ── Consolidated endpoint for dashboard page ──────────────────────────────────
  // Returns all chart datasets in one call to minimise round-trips.

  @Get('stats')
  getStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getStats(query);
  }

  // ── Granular endpoints for individual chart widgets ───────────────────────────

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
