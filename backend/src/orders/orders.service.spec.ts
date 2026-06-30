import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

/**
 * These tests focus on order-lifecycle integrity — the rules that keep order
 * statuses and inventory consistent. The Mongoose models are mocked so the
 * logic can be exercised without a live database.
 */
describe('OrdersService — lifecycle & inventory', () => {
  let service: OrdersService;
  let orderModel: any;
  let cartModel: any;
  let productModel: any;
  let productsService: any;
  let cartService: any;

  const execable = (value: any) => ({ exec: jest.fn().mockResolvedValue(value) });

  // Builds a fake order document with a chainable save().
  function makeOrder(overrides: Partial<any> = {}) {
    const order: any = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      items: [
        { productId: new Types.ObjectId(), name: 'Widget', quantity: 2, price: 10 },
      ],
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID,
      ...overrides,
    };
    order.save = jest.fn().mockResolvedValue(order);
    return order;
  }

  beforeEach(() => {
    orderModel = { findById: jest.fn() };
    cartModel = { findOne: jest.fn() };
    productModel = {
      updateOne: jest.fn().mockReturnValue(execable({})),
      findOneAndUpdate: jest.fn(),
    };
    productsService = { findOne: jest.fn() };
    cartService = { clearCart: jest.fn() };

    service = new OrdersService(
      orderModel,
      cartModel,
      productModel,
      productsService,
      cartService,
    );
  });

  describe('updateStatus', () => {
    it('allows a legal transition (pending → processing)', async () => {
      const order = makeOrder({ status: OrderStatus.PENDING });
      orderModel.findById.mockReturnValue(execable(order));

      await service.updateStatus(order._id.toString(), {
        status: OrderStatus.PROCESSING,
      });

      expect(order.status).toBe(OrderStatus.PROCESSING);
      expect(order.save).toHaveBeenCalled();
    });

    it('rejects an illegal transition (pending → shipped)', async () => {
      const order = makeOrder({ status: OrderStatus.PENDING });
      orderModel.findById.mockReturnValue(execable(order));

      await expect(
        service.updateStatus(order._id.toString(), {
          status: OrderStatus.SHIPPED,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects any transition out of a terminal status (delivered)', async () => {
      const order = makeOrder({ status: OrderStatus.DELIVERED });
      orderModel.findById.mockReturnValue(execable(order));

      await expect(
        service.updateStatus(order._id.toString(), {
          status: OrderStatus.SHIPPED,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('restores stock when an order is cancelled by an admin', async () => {
      const order = makeOrder({ status: OrderStatus.PROCESSING });
      orderModel.findById.mockReturnValue(execable(order));

      await service.updateStatus(order._id.toString(), {
        status: OrderStatus.CANCELLED,
      });

      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(productModel.updateOne).toHaveBeenCalledWith(
        { _id: order.items[0].productId },
        { $inc: { stock: order.items[0].quantity } },
      );
    });

    it('throws when the order does not exist', async () => {
      orderModel.findById.mockReturnValue(execable(null));

      await expect(
        service.updateStatus(new Types.ObjectId().toString(), {
          status: OrderStatus.PROCESSING,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('cancels a pending order and restores its stock', async () => {
      const userId = new Types.ObjectId();
      const order = makeOrder({ status: OrderStatus.PENDING, userId });
      orderModel.findById.mockReturnValue(execable(order));

      const result = await service.cancel(order._id.toString(), userId.toString());

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(productModel.updateOne).toHaveBeenCalledWith(
        { _id: order.items[0].productId },
        { $inc: { stock: order.items[0].quantity } },
      );
    });

    it('refuses to cancel a delivered order', async () => {
      const userId = new Types.ObjectId();
      const order = makeOrder({ status: OrderStatus.DELIVERED, userId });
      orderModel.findById.mockReturnValue(execable(order));

      await expect(
        service.cancel(order._id.toString(), userId.toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('checkout', () => {
    it('rejects checkout when the cart is empty', async () => {
      cartModel.findOne.mockResolvedValue({ items: [] });

      await expect(
        service.checkout(new Types.ObjectId().toString(), {}),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rolls back reserved stock if a later item is out of stock', async () => {
      const p1 = new Types.ObjectId();
      const p2 = new Types.ObjectId();
      cartModel.findOne.mockResolvedValue({
        items: [
          { productId: p1, quantity: 1, price: 10 },
          { productId: p2, quantity: 1, price: 20 },
        ],
      });
      productsService.findOne.mockImplementation((id: string) => {
        if (id === p1.toString()) return { name: 'A', price: 10, stock: 5 };
        return { name: 'B', price: 20, stock: 5 };
      });
      // First decrement succeeds, second fails (returns null) → triggers rollback.
      productModel.findOneAndUpdate
        .mockReturnValueOnce(execable({ _id: p1 }))
        .mockReturnValueOnce(execable(null));

      await expect(
        service.checkout(new Types.ObjectId().toString(), {}),
      ).rejects.toBeInstanceOf(BadRequestException);

      // The first item's reserved stock must be returned.
      expect(productModel.updateOne).toHaveBeenCalledWith(
        { _id: p1 },
        { $inc: { stock: 1 } },
      );
    });
  });
});
