import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username or email is required' })
  @Transform(({ value }) => value?.trim())
  identifier: string; // accepts username OR email

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
