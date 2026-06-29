import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
