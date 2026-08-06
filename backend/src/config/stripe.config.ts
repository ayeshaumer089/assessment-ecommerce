import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // ISO-4217 code. Must match the currency your Stripe account settles in.
  currency: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
}));
