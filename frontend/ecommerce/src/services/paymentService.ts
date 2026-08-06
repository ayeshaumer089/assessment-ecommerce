import api from '@/lib/axiosInstance'
import type { Address } from '@/types'

export interface StripeConfig {
  publishableKey: string | null
  currency: string
  enabled: boolean
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  publishableKey?: string
}

export interface PaymentCard {
  brand?: string
  last4?: string
  expMonth?: number
  expYear?: number
  receiptUrl?: string
}

export interface PaymentIntentSummary {
  paymentIntentId: string
  status: string
  amount: number
  currency: string
  card: PaymentCard | null
  orderId: string | null
}

export interface CreatePaymentIntentPayload {
  shippingAddress?: Address
}

export const paymentService = {
  /** Publishable key + currency for this environment. Unauthenticated. */
  async getConfig(): Promise<StripeConfig> {
    const { data } = await api.get<StripeConfig>('/payments/config')
    return data
  },

  /**
   * Asks the server to open (or re-price) a PaymentIntent for the current cart.
   * Note there is no `amount` — the server prices the cart itself.
   */
  async createIntent(
    payload: CreatePaymentIntentPayload = {},
  ): Promise<PaymentIntentResponse> {
    const { data } = await api.post<PaymentIntentResponse>(
      '/payments/create-intent',
      payload,
    )
    return data
  },

  /** Post-confirmation status + PCI-safe card details for the review step. */
  async getIntent(id: string): Promise<PaymentIntentSummary> {
    const { data } = await api.get<PaymentIntentSummary>(`/payments/intent/${id}`)
    return data
  },
}
