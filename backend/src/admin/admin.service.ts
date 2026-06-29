import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { PaymentStatus } from '../orders/enums/payment-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getStats() {
    const [
      totalUsers,
      totalProducts,
      outOfStock,
      totalOrders,
      statusCounts,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.productModel.countDocuments(),
      this.productModel.countDocuments({ stock: 0 }),
      this.orderModel.countDocuments(),
      this.orderModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate<{ total: number }>([
        { $match: { paymentStatus: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.find().sort({ createdAt: -1 }).limit(5).exec(),
    ]);

    const ordersByStatus = Object.fromEntries(
      statusCounts.map(({ _id, count }) => [_id, count]),
    );

    return {
      users: {
        total: totalUsers,
      },
      products: {
        total: totalProducts,
        outOfStock,
      },
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus,
      },
      revenue: {
        total: parseFloat(((revenueResult[0]?.total) ?? 0).toFixed(2)),
      },
      recentOrders,
    };
  }
}
