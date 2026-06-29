import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class UpdateOrderDto {
  @IsEnum(OrderStatus, {
    message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus, {
    message: `Payment status must be one of: ${Object.values(PaymentStatus).join(', ')}`,
  })
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
