import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsMongoId({ message: 'parent must be a valid MongoDB ObjectId' })
  @IsOptional()
  parent?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}
