import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0, { message: 'Quantity must be 0 or greater (0 removes the item)' })
  @Type(() => Number)
  quantity: number;
}
