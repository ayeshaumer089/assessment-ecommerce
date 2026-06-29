import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class SeedQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  force?: boolean = false; // if true, drops existing data before seeding
}
