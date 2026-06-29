import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getOverview(): Promise<any> {
    // TODO: total users, products, orders, revenue
    return {};
  }

  async getSalesData(_period?: string): Promise<any> {
    // TODO: aggregated sales by day/week/month
    return {};
  }

  async getTopProducts(_limit?: number): Promise<any> {
    // TODO: products sorted by revenue
    return [];
  }

  async getOrderStatusBreakdown(): Promise<any> {
    // TODO: count orders by status
    return {};
  }

  async getRecentOrders(_limit?: number): Promise<any> {
    // TODO: last N orders with user + items info
    return [];
  }
}
