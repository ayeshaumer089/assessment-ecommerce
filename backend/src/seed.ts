import { setDefaultResultOrder } from 'node:dns';
import { promises as dns } from 'node:dns';

// Fix DNS resolution for MongoDB Atlas SRV records on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);
setDefaultResultOrder('ipv4first');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  
  try {
    await seedService.seed();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
  
  await app.close();
}

bootstrap();
