import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  discountPercentage?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsMongoId({ message: 'category must be a valid MongoDB ObjectId' })
  category: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  brand?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
