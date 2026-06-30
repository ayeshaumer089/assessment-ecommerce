import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(120)
  fullName: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Street address is required' })
  @MaxLength(200)
  street: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  apt?: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(80)
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  @MaxLength(80)
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Zip code is required' })
  @MaxLength(20)
  zipCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @MaxLength(80)
  country: string;
}

export class CheckoutDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
