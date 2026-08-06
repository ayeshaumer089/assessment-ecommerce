import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type Stripe from 'stripe';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { StripeService } from '../stripe/stripe.service';
import { OrdersService, OrderDraft } from '../orders/orders.service';
import { PaymentStatus } from '../orders/enums/payment-status.enum';

/** Intent states that can still be paid, and are therefore safe to reuse. */
const REUSABLE_STATUSES = [
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
];

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  publishableKey?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
  ) {}

  // ── Intent lifecycle ─────────────────────────────────────────────────────────

  /**
   * Creates (or reuses) the PaymentIntent for the caller's current cart.
   *
   * The amount is derived server-side from live product prices — the request
   * body has no say in it. If the customer edits their cart and comes back,
   * the existing open intent is re-priced in place rather than abandoned, so
   * Stripe's dashboard doesn't fill up with orphaned intents.
   */
  async createOrUpdateIntent(
    userId: string,
    dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponse> {
    const draft = await this.ordersService.buildOrderDraft(userId);

    if (draft.totalAmount <= 0) {
      throw new BadRequestException('Order total must be greater than zero');
    }

    const currency = this.stripeService.currency;
    const amountMinor = StripeService.toMinorUnits(draft.totalAmount);

    const shipping = dto.shippingAddress
      ? { shipping: toStripeShipping(dto.shippingAddress) }
      : {};

    const reusable = await this.findReusablePayment(userId);

    let intent: Stripe.PaymentIntent | null = reusable
      ? await this.tryReuseIntent(reusable, amountMinor, userId, draft, shipping)
      : null;

    if (!intent) {
      intent = await this.stripeService.client.paymentIntents.create({
        amount: amountMinor,
        currency,
        // Lets Stripe surface whichever methods are enabled on the account
        // (card, wallets, BNPL) without any further code changes here.
        automatic_payment_methods: { enabled: true },
        metadata: this.buildMetadata(userId, draft),
        description: `ShopSphere order — ${draft.items.length} item(s)`,
        ...shipping,
      });
    }

    await this.upsertPaymentRecord(userId, intent, draft, dto);

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: draft.totalAmount,
      currency,
      publishableKey: this.stripeService.publishableKey,
    };
  }

  /**
   * Read-only view of an intent for the checkout review step: status plus the
   * PCI-safe card fields. Scoped to the owner so ids can't be enumerated.
   */
  async getIntentSummary(userId: string, paymentIntentId: string) {
    const record = await this.paymentModel
      .findOne({ paymentIntentId, userId: new Types.ObjectId(userId) })
      .exec();

    if (!record) throw new NotFoundException('Payment not found');

    const intent = await this.stripeService.client.paymentIntents.retrieve(
      paymentIntentId,
      { expand: ['payment_method', 'latest_charge'] },
    );

    const card = extractCard(intent);
    if (card) {
      record.card = card;
    }
    record.status = intent.status;

    // The browser hits this right after confirming, which makes it the earliest
    // reliable point to refresh the record when no webhook is configured.
    if (!record.orderId) {
      const order = await this.ordersService.findByPaymentIntent(intent.id);
      if (order) record.orderId = order._id as Types.ObjectId;
    }

    await record.save();

    return {
      paymentIntentId: intent.id,
      status: intent.status,
      amount: StripeService.fromMinorUnits(intent.amount),
      currency: intent.currency,
      card: card ?? null,
      orderId: record.orderId ? record.orderId.toString() : null,
    };
  }

  // ── Webhooks ─────────────────────────────────────────────────────────────────

  /**
   * Authoritative fulfilment path. Webhooks are the only delivery Stripe
   * guarantees — the browser may never come back — so anything that must
   * happen after a successful charge happens here too, idempotently.
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<{ received: true }> {
    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(rawBody, signature);
    } catch (err: any) {
      // A bad signature means the payload isn't from Stripe. 400 tells Stripe
      // not to bother retrying.
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Stripe webhook received: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.onPaymentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          event.id,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.onPaymentFailed(
          event.data.object as Stripe.PaymentIntent,
          event.id,
        );
        break;

      case 'charge.refunded':
        await this.onChargeRefunded(event.data.object as Stripe.Charge, event.id);
        break;

      default:
        // Unhandled types are acknowledged, not errored — otherwise Stripe
        // retries them forever.
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async onPaymentSucceeded(
    intent: Stripe.PaymentIntent,
    eventId: string,
  ): Promise<void> {
    const record = await this.claimEvent(intent.id, eventId);
    if (!record) return; // already processed, or unknown intent

    const card = extractCard(intent);
    record.status = intent.status;
    if (card) record.card = card;
    if (card?.receiptUrl) record.receiptUrl = card.receiptUrl;

    // Safety net: create the order the browser may never have asked for.
    if (!record.orderId) {
      const draft: OrderDraft = {
        items: record.items as any,
        subtotal: record.subtotal,
        shippingCost: record.shippingCost,
        totalAmount: record.amount,
      };

      if (draft.items.length) {
        const order = await this.ordersService.createPaidOrder({
          userId: record.userId.toString(),
          draft,
          paymentIntentId: intent.id,
          shippingAddress: record.shippingAddress,
          card,
        });
        record.orderId = order._id as Types.ObjectId;
        this.logger.log(`Order ${order._id} fulfilled from webhook ${eventId}`);
      }
    }

    await record.save();
  }

  private async onPaymentFailed(
    intent: Stripe.PaymentIntent,
    eventId: string,
  ): Promise<void> {
    const record = await this.claimEvent(intent.id, eventId);
    if (!record) return;

    record.status = intent.status;
    record.failureMessage =
      intent.last_payment_error?.message || 'Payment failed';
    await record.save();
  }

  private async onChargeRefunded(
    charge: Stripe.Charge,
    eventId: string,
  ): Promise<void> {
    const intentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (!intentId) return;

    const record = await this.claimEvent(intentId, eventId);
    if (!record) return;

    record.amountRefunded = StripeService.fromMinorUnits(charge.amount_refunded);
    await record.save();

    if (record.orderId) {
      await this.ordersService.markPaymentStatus(
        record.orderId,
        PaymentStatus.REFUNDED,
      );
    }
  }

  // ── Internals ────────────────────────────────────────────────────────────────

  /**
   * Atomically marks an event as processed and returns the payment record.
   * Returns null when this event was already handled — Stripe delivers
   * at-least-once, so every handler must tolerate replays.
   */
  private async claimEvent(
    paymentIntentId: string,
    eventId: string,
  ): Promise<PaymentDocument | null> {
    const record = await this.paymentModel
      .findOneAndUpdate(
        { paymentIntentId, processedEventIds: { $ne: eventId } },
        { $push: { processedEventIds: eventId } },
        { new: true },
      )
      .exec();

    if (!record) {
      this.logger.debug(
        `Skipping event ${eventId} — already processed or intent ${paymentIntentId} is unknown`,
      );
    }

    return record;
  }

  private async findReusablePayment(
    userId: string,
  ): Promise<PaymentDocument | null> {
    return this.paymentModel
      .findOne({
        userId: new Types.ObjectId(userId),
        orderId: null,
        status: { $in: REUSABLE_STATUSES },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Re-prices a previously opened intent, but only after asking Stripe what
   * state it is actually in.
   *
   * Our stored status is a cache, and it goes stale whenever a payment
   * completes without a webhook reaching us — which is the normal case in
   * local development. Trusting it would mean trying to re-price an intent
   * that has already been paid, which Stripe rejects outright. Anything
   * unexpected here degrades to "open a fresh intent" rather than failing the
   * customer's checkout.
   */
  private async tryReuseIntent(
    record: PaymentDocument,
    amountMinor: number,
    userId: string,
    draft: OrderDraft,
    shipping: Record<string, any>,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      const live = await this.stripeService.client.paymentIntents.retrieve(
        record.paymentIntentId,
      );

      if (!REUSABLE_STATUSES.includes(live.status)) {
        await this.reconcileStaleRecord(record, live);
        return null;
      }

      return await this.stripeService.client.paymentIntents.update(
        record.paymentIntentId,
        {
          amount: amountMinor,
          metadata: this.buildMetadata(userId, draft),
          ...shipping,
        },
      );
    } catch (err: any) {
      this.logger.warn(
        `Could not reuse intent ${record.paymentIntentId} (${err?.message}). ` +
          `Opening a new one.`,
      );
      return null;
    }
  }

  /**
   * Brings a stale local record back in line with Stripe, and links the order
   * the browser created directly if the webhook never told us about it.
   */
  private async reconcileStaleRecord(
    record: PaymentDocument,
    live: Stripe.PaymentIntent,
  ): Promise<void> {
    const order = await this.ordersService.findByPaymentIntent(live.id);

    await this.paymentModel
      .updateOne(
        { _id: record._id },
        {
          $set: {
            status: live.status,
            ...(order ? { orderId: order._id } : {}),
          },
        },
      )
      .exec();

    this.logger.debug(
      `Reconciled payment ${live.id}: status → ${live.status}` +
        (order ? `, linked order ${order._id}` : ''),
    );
  }

  private async upsertPaymentRecord(
    userId: string,
    intent: Stripe.PaymentIntent,
    draft: OrderDraft,
    dto: CreatePaymentIntentDto,
  ): Promise<void> {
    await this.paymentModel
      .findOneAndUpdate(
        { paymentIntentId: intent.id },
        {
          $set: {
            userId: new Types.ObjectId(userId),
            amount: draft.totalAmount,
            currency: intent.currency,
            status: intent.status,
            items: draft.items,
            subtotal: draft.subtotal,
            shippingCost: draft.shippingCost,
            shippingAddress: dto.shippingAddress ?? null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  /**
   * Stripe caps metadata at 500 chars per value, so this carries identifiers
   * only. The full basket lives in our `payments` collection.
   */
  private buildMetadata(
    userId: string,
    draft: OrderDraft,
  ): Record<string, string> {
    return {
      userId,
      itemCount: String(draft.items.reduce((n, i) => n + i.quantity, 0)),
      subtotal: draft.subtotal.toFixed(2),
      shipping: draft.shippingCost.toFixed(2),
      total: draft.totalAmount.toFixed(2),
    };
  }
}

// ── Pure helpers ───────────────────────────────────────────────────────────────

function extractCard(intent: Stripe.PaymentIntent) {
  const method = intent.payment_method;
  const card = method && typeof method !== 'string' ? (method as any).card : null;

  const charge = intent.latest_charge;
  const receiptUrl =
    charge && typeof charge !== 'string'
      ? (charge as Stripe.Charge).receipt_url || undefined
      : undefined;

  if (!card) return receiptUrl ? ({ receiptUrl } as any) : null;

  return {
    brand: card.brand,
    last4: card.last4,
    expMonth: card.exp_month,
    expYear: card.exp_year,
    receiptUrl,
  };
}

/**
 * Stripe requires ISO 3166-1 alpha-2 country codes, but the checkout form
 * collects free text. Cover the common spellings and fall back to omitting
 * the country rather than failing the whole intent over a shipping label.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  'great britain': 'GB',
  england: 'GB',
  canada: 'CA',
  australia: 'AU',
  india: 'IN',
  pakistan: 'PK',
  germany: 'DE',
  france: 'FR',
  spain: 'ES',
  italy: 'IT',
  netherlands: 'NL',
  ireland: 'IE',
  'new zealand': 'NZ',
  'united arab emirates': 'AE',
  uae: 'AE',
  singapore: 'SG',
};

function toIsoCountry(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return COUNTRY_ALIASES[trimmed.toLowerCase()];
}

function toStripeShipping(address: Record<string, any>) {
  const country = toIsoCountry(address.country);

  return {
    name: address.fullName,
    phone: address.phone || undefined,
    address: {
      line1: address.street,
      line2: address.apt || undefined,
      city: address.city,
      state: address.state,
      postal_code: address.zipCode,
      ...(country ? { country } : {}),
    },
  };
}
