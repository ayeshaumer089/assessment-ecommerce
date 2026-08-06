import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// The SDK is published as a CommonJS `export =` module and this project builds
// without `esModuleInterop`, so a default import compiles to `.default` and
// blows up at runtime. `import ... = require(...)` binds the constructor
// itself while keeping the `Stripe.*` namespace types.
import Stripe = require('stripe');

/**
 * Thin, single-responsibility wrapper around the Stripe SDK.
 *
 * Owns exactly one concern: constructing and exposing a configured Stripe
 * client (plus signature verification, which needs the same secrets).
 * Business rules live in PaymentsService / OrdersService — this class stays
 * free of them so it can be injected anywhere without dragging domain logic in.
 */
@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const secretKey = this.configService.get<string>('stripe.secretKey');

    if (!secretKey) {
      // Don't crash the whole API — the rest of the app is still usable, and
      // payment endpoints will surface a clear 503 instead of a cryptic error.
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set — payment endpoints are disabled.',
      );
      return;
    }

    this.stripe = new Stripe(secretKey, {
      // Retry transient network/5xx failures before giving up.
      maxNetworkRetries: 2,
      timeout: 20_000,
      appInfo: { name: 'ShopSphere', version: '1.0.0' },
    });

    this.logger.log(
      `Stripe client initialised (${secretKey.startsWith('sk_live') ? 'LIVE' : 'TEST'} mode)`,
    );
  }

  /** True when Stripe credentials are configured. */
  get isEnabled(): boolean {
    return this.stripe !== null;
  }

  /** The configured publishable key, safe to expose to the browser. */
  get publishableKey(): string | undefined {
    return this.configService.get<string>('stripe.publishableKey');
  }

  /** Default settlement currency for new charges. */
  get currency(): string {
    return this.configService.get<string>('stripe.currency', 'usd');
  }

  /** The raw SDK client. Throws a 503 when Stripe is not configured. */
  get client(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Payments are not configured on this server.',
      );
    }
    return this.stripe;
  }

  /**
   * Verifies a webhook payload against the `Stripe-Signature` header.
   * Must be given the **raw** request body — any JSON re-serialisation
   * invalidates the signature.
   */
  constructEvent(rawBody: Buffer | string, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );

    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'STRIPE_WEBHOOK_SECRET is not configured.',
      );
    }

    return this.client.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  // ── Money helpers ───────────────────────────────────────────────────────────
  // Stripe works in the currency's smallest unit (cents for USD). Keeping the
  // conversion in one place avoids the classic off-by-one-cent rounding bugs.

  /** 129.99 → 12999 */
  static toMinorUnits(amount: number): number {
    return Math.round(amount * 100);
  }

  /** 12999 → 129.99 */
  static fromMinorUnits(amount: number): number {
    return parseFloat((amount / 100).toFixed(2));
  }
}
