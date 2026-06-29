import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { PaymentStatus } from '../orders/enums/payment-status.enum';
import { DashboardQueryDto, DashboardPeriod } from './dto/dashboard-query.dto';

// ── Types returned to the frontend ───────────────────────────────────────────

export interface SalesDataPoint {
  date: string;       // "2026-06" or "2026-06-29"
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  // ── Consolidated stats (single round-trip bundle for the dashboard) ──────────

  async getStats(query: DashboardQueryDto) {
    const { period = DashboardPeriod.MONTH, limit = 5 } = query;

    const [overview, salesChart, orderStatusChart, topProducts, recentOrders] =
      await Promise.all([
        this.getOverview(),
        this.getSalesData(period),
        this.getOrderStatusBreakdown(),
        this.getTopProducts(limit),
        this.getRecentOrders(10),
      ]);

    return {
      overview,
      charts: {
        sales: salesChart,           // line / bar chart
        orderStatus: orderStatusChart, // pie / donut chart
        topProducts,                 // horizontal bar chart
      },
      recentOrders,
    };
  }

  // ── KPI overview ────────────────────────────────────────────────────────────

  async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalProducts,
      outOfStock,
      totalOrders,
      allRevenue,
      thisMonthOrders,
      lastMonthOrders,
      thisMonthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.productModel.countDocuments(),
      this.productModel.countDocuments({ stock: 0 }),
      this.orderModel.countDocuments(),
      this.orderModel.aggregate<{ total: number }>([
        { $match: { paymentStatus: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.orderModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
      }),
      this.orderModel.aggregate<{ total: number }>([
        {
          $match: {
            paymentStatus: PaymentStatus.PAID,
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.aggregate<{ total: number }>([
        {
          $match: {
            paymentStatus: PaymentStatus.PAID,
            createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = round(allRevenue[0]?.total ?? 0);
    const thisMonthRev = round(thisMonthRevenue[0]?.total ?? 0);
    const lastMonthRev = round(lastMonthRevenue[0]?.total ?? 0);

    return {
      totalUsers,
      totalProducts,
      outOfStock,
      totalOrders,
      totalRevenue,
      thisMonth: { orders: thisMonthOrders, revenue: thisMonthRev },
      lastMonth: { orders: lastMonthOrders, revenue: lastMonthRev },
      // null when there is no prior-month baseline to compare against
      growth: {
        orders: growthRate(thisMonthOrders, lastMonthOrders),
        revenue: growthRate(thisMonthRev, lastMonthRev),
      },
    };
  }

  // ── Sales over time — grouped by day or month depending on period ────────────

  async getSalesData(period: DashboardPeriod | string = DashboardPeriod.MONTH): Promise<SalesDataPoint[]> {
    const { startDate, dateFormat } = periodBounds(period as DashboardPeriod);

    return this.orderModel.aggregate<SalesDataPoint>([
      {
        $match: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orders: 1,
        },
      },
    ]);
  }

  // ── Top products by revenue — for bar chart ──────────────────────────────────

  async getTopProducts(limit: number | string = 5): Promise<TopProduct[]> {
    return this.orderModel.aggregate<TopProduct>([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          name: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1,
        },
      },
    ]);
  }

  // ── Orders by status — for pie / donut chart ─────────────────────────────────

  async getOrderStatusBreakdown(): Promise<StatusBreakdown[]> {
    const [counts, total] = await Promise.all([
      this.orderModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.orderModel.countDocuments(),
    ]);

    return counts.map(({ _id, count }) => ({
      status: _id,
      count,
      percentage: total > 0 ? round((count / total) * 100) : 0,
    }));
  }

  // ── Recent orders — for activity feed ────────────────────────────────────────

  async getRecentOrders(limit: number | string = 10) {
    return this.orderModel
      .find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .exec();
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function round(n: number, decimals = 2): number {
  return parseFloat(n.toFixed(decimals));
}

function growthRate(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return round(((current - previous) / previous) * 100);
}

function periodBounds(period: DashboardPeriod): {
  startDate: Date;
  dateFormat: string;
} {
  const now = new Date();
  switch (period) {
    case DashboardPeriod.WEEK:
      return {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        dateFormat: '%Y-%m-%d',
      };
    case DashboardPeriod.YEAR:
      return {
        startDate: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        dateFormat: '%Y-%m',
      };
    default: // MONTH
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dateFormat: '%Y-%m-%d',
      };
  }
}
