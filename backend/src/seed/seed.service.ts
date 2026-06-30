import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Role } from '../users/enums/role.enum';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { PaymentStatus } from '../orders/enums/payment-status.enum';
import { calculateShipping } from '../common/constants/shipping';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seed...');
    
    await this.clearExistingData();
    await this.seedCategories();
    const products = await this.seedProducts();
    const { admin, customer } = await this.seedUsers();
    await this.seedOrders(customer, products);
    
    this.logger.log('Database seed completed successfully');
  }

  private async clearExistingData(): Promise<void> {
    this.logger.log('Clearing existing data...');
    await this.userModel.deleteMany({});
    await this.productModel.deleteMany({});
    await this.categoryModel.deleteMany({});
    await this.orderModel.deleteMany({});
  }

  private async seedCategories(): Promise<void> {
    this.logger.log('Seeding categories...');
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and gardening supplies' },
      { name: 'Books', slug: 'books', description: 'Books and literature' },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment and gear' },
    ];
    await this.categoryModel.insertMany(categories);
  }

  private async seedProducts(): Promise<ProductDocument[]> {
    this.logger.log('Seeding products...');
    const products = [
      { name: 'Wireless Headphones', description: 'High-quality wireless noise-canceling headphones with 30-hour battery life.', price: 199.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', category: 'electronics', stock: 50 },
      { name: 'Smart Watch', description: 'Feature-rich smartwatch with heart rate monitor, GPS, and notifications.', price: 299.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', category: 'electronics', stock: 30 },
      { name: 'Laptop Backpack', description: 'Durable water-resistant laptop backpack with multiple compartments.', price: 49.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', category: 'clothing', stock: 100 },
      { name: 'Organic Cotton T-Shirt', description: 'Comfortable organic cotton t-shirt available in various colors.', price: 24.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', category: 'clothing', stock: 200 },
      { name: 'Desk Lamp', description: 'Modern LED desk lamp with adjustable brightness and color temperature.', price: 39.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop', category: 'home-garden', stock: 75 },
      { name: 'Indoor Plant', description: 'Easy-to-care-for indoor plant that purifies the air.', price: 29.99, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop', category: 'home-garden', stock: 40 },
      { name: 'Programming Book', description: 'Comprehensive guide to modern web development.', price: 44.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', category: 'books', stock: 60 },
      { name: 'Fiction Novel', description: 'Bestselling fiction novel that will keep you engaged.', price: 19.99, image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=300&fit=crop', category: 'books', stock: 80 },
      { name: 'Yoga Mat', description: 'Non-slip yoga mat perfect for all types of workouts.', price: 34.99, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop', category: 'sports', stock: 90 },
      { name: 'Running Shoes', description: 'Lightweight running shoes with excellent cushioning.', price: 129.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', category: 'sports', stock: 45 },
      { name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker with rich sound and long battery life.', price: 79.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop', category: 'electronics', stock: 65 },
      { name: 'Denim Jeans', description: 'Classic denim jeans with a modern fit.', price: 59.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop', category: 'clothing', stock: 120 },
    ];
    return await this.productModel.insertMany(products);
  }

  private async seedUsers(): Promise<{ admin: UserDocument; customer: UserDocument }> {
    this.logger.log('Seeding users...');
    
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: Role.ADMIN,
    };
    
    const customerData = {
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'Customer123!',
      role: Role.CUSTOMER,
    };

    const admin = await this.userModel.create(adminData);
    const customer = await this.userModel.create(customerData);

    console.log('\n========================================');
    console.log('Created Login Credentials:');
    console.log('========================================');
    console.log(`Admin User:`);
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log(`\nCustomer User:`);
    console.log(`  Email: ${customerData.email}`);
    console.log(`  Password: ${customerData.password}`);
    console.log('========================================\n');

    return { admin, customer };
  }

  private async seedOrders(customer: UserDocument, products: ProductDocument[]): Promise<void> {
    this.logger.log('Seeding orders...');

    const shippingAddress = {
      fullName: 'Customer User',
      phone: '+1 555 0100',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'United States',
    };

    // Each entry: which products and quantities make up the order.
    const lineSpecs: Array<{
      lines: Array<{ product: ProductDocument; quantity: number }>;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
    }> = [
      {
        lines: [
          { product: products[0], quantity: 1 },
          { product: products[1], quantity: 1 },
        ],
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
      },
      {
        lines: [{ product: products[3], quantity: 2 }],
        status: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.PAID,
      },
      {
        lines: [
          { product: products[6], quantity: 1 },
          { product: products[8], quantity: 1 },
        ],
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
    ];

    const orders = lineSpecs.map((spec) => {
      const items = spec.lines.map(({ product, quantity }) => ({
        productId: product._id,
        name: product.name,
        image: product.image,
        quantity,
        price: product.price,
      }));
      const subtotal = round(
        spec.lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
      );
      const shippingCost = calculateShipping(subtotal);
      return {
        userId: customer._id,
        items,
        subtotal,
        shippingCost,
        totalAmount: round(subtotal + shippingCost),
        shippingAddress,
        paymentMethod: 'Card (mock)',
        status: spec.status,
        paymentStatus: spec.paymentStatus,
      };
    });

    await this.orderModel.insertMany(orders);

    // Reflect seeded orders in inventory so stock numbers stay consistent.
    const decrements = new Map<string, number>();
    for (const spec of lineSpecs) {
      for (const { product, quantity } of spec.lines) {
        const id = String(product._id);
        decrements.set(id, (decrements.get(id) ?? 0) + quantity);
      }
    }
    await Promise.all(
      [...decrements.entries()].map(([id, qty]) =>
        this.productModel.updateOne({ _id: id }, { $inc: { stock: -qty } }),
      ),
    );
  }
}

function round(n: number, decimals = 2): number {
  return parseFloat(n.toFixed(decimals));
}
