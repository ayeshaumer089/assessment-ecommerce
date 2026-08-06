import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddressDto } from '../../orders/dto/checkout.dto';

export class CreatePaymentIntentDto {
  /**
   * Captured at step 1 of checkout. Stored alongside the intent so a webhook
   * can still build a complete order if the browser never returns.
   *
   * Note there is deliberately no `amount` field — the server always prices
   * the cart itself. A client-supplied amount is the single most common way
   * payment integrations get exploited.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
