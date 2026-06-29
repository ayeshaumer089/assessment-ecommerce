import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum DashboardPeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class DashboardQueryDto {
  @IsEnum(DashboardPeriod, {
    message: `Period must be one of: ${Object.values(DashboardPeriod).join(', ')}`,
  })
  @IsOptional()
  period?: DashboardPeriod = DashboardPeriod.MONTH;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 5;
}
