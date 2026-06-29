import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async register(_dto: RegisterDto): Promise<any> {
    // TODO: check email/username uniqueness, create user, return tokens
    throw new Error('Not implemented');
  }

  async login(_dto: LoginDto): Promise<any> {
    // TODO: validate credentials, return access + refresh tokens
    throw new Error('Not implemented');
  }

  async logout(_userId: string): Promise<void> {
    // TODO: invalidate refresh token
  }

  async refreshTokens(_userId: string, _refreshToken: string): Promise<any> {
    // TODO: validate refresh token, return new token pair
    throw new Error('Not implemented');
  }

  async getProfile(_userId: string): Promise<any> {
    // TODO: return authenticated user's profile
    throw new Error('Not implemented');
  }
}
