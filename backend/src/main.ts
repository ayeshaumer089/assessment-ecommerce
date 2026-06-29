import { setDefaultResultOrder } from 'node:dns';
import { promises as dns } from 'node:dns';

// Force Node.js to use Google DNS (8.8.8.8) to resolve MongoDB Atlas SRV records
// This fixes ECONNREFUSED errors caused by local DNS not resolving Atlas hostnames
dns.setServers(['8.8.8.8', '8.8.4.4']);
setDefaultResultOrder('ipv4first');

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // ── Global prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global pipes ─────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global filters ───────────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global interceptors ──────────────────────────────────────────────────────
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  await app.listen(port);

  console.log(`\n🚀 ShopSphere API running on: http://localhost:${port}/api`);
  console.log(`📦 Environment: ${nodeEnv}`);
  console.log(`📚 Database: MongoDB Atlas\n`);
}

bootstrap();
