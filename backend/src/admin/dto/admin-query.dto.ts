import { IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminQueryDto {
  @IsDateString({}, { message: 'startDate must be a valid ISO date string' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'endDate must be a valid ISO date string' })
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
