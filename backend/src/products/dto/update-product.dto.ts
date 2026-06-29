import {
  IsString,
  IsNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MinLength(2, { message: 'Product name must be at least 2 characters' })
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be greater than 0' })
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @IsString()
  @IsNotEmpty({ message: 'Image URL is required' })
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  category?: string;

  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  @Type(() => Number)
  @IsOptional()
  stock?: number;
}
