import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async getStats(): Promise<any> {
    // TODO: aggregate users, products, orders counts
    return {};
  }
}
