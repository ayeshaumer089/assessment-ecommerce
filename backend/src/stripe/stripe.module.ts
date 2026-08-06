import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

/**
 * Global so both OrdersModule (verifying an intent at checkout) and
 * PaymentsModule (creating intents / handling webhooks) can inject the same
 * client without either importing the other — which would create a cycle.
 */
@Global()
@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
