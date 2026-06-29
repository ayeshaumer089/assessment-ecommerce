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
