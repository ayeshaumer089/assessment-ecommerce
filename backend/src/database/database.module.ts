import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.name', 'ecommerce'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB Atlas connected successfully');
          });
          connection.on('error', (error: Error) => {
            console.error('❌ MongoDB connection error:', error.message);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
