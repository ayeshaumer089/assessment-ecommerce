import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  async seed(): Promise<void> {
    this.logger.log('Starting database seed...');
    await this.seedCategories();
    await this.seedProducts();
    await this.seedAdminUser();
    this.logger.log('Database seed completed successfully');
  }

  private async seedCategories(): Promise<void> {
    // TODO: create default categories (Electronics, Clothing, etc.)
    this.logger.log('Seeding categories...');
  }

  private async seedProducts(): Promise<void> {
    // TODO: create sample products
    this.logger.log('Seeding products...');
  }

  private async seedAdminUser(): Promise<void> {
    // TODO: create default admin user if none exists
    this.logger.log('Seeding admin user...');
  }
}
