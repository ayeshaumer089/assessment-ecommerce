import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { StripeService } from '../stripe/stripe.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  // ── Public config ────────────────────────────────────────────────────────────

  /**
   * Lets the SPA bootstrap Stripe.js without baking the publishable key into
   * its bundle — the key can then be rotated per environment server-side.
   */
  @Get('config')
  @Public()
  getConfig() {
    return {
      publishableKey: this.stripeService.publishableKey ?? null,
      currency: this.stripeService.currency,
      enabled: this.stripeService.isEnabled,
    };
  }

  // ── Customer routes ──────────────────────────────────────────────────────────

  @Post('create-intent')
  @HttpCode(HttpStatus.CREATED)
  createIntent(@CurrentUser() user: any, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createOrUpdateIntent(user.id, dto);
  }

  @Get('intent/:id')
  getIntent(@CurrentUser() user: any, @Param('id') id: string) {
    return this.paymentsService.getIntentSummary(user.id, id);
  }

  // ── Stripe webhook ───────────────────────────────────────────────────────────

  /**
   * Called by Stripe, not the browser — hence `@Public()`. Authentication is
   * the signature check inside the service, which needs the *raw* body
   * (see `rawBody: true` in main.ts).
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!req.rawBody) {
      throw new BadRequestException(
        'Raw request body unavailable — webhook cannot be verified',
      );
    }

    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}
