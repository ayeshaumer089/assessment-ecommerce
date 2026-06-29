import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGO_URI,
  name: process.env.DB_NAME || 'ecommerce',
}));
