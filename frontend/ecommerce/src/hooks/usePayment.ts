import { useMutation, useQuery } from '@tanstack/react-query'
import { paymentService, type CreatePaymentIntentPayload } from '@/services/paymentService'
import { QUERY_KEYS } from '@/constants'

/** Stripe environment config (publishable key, currency). Cached for the session. */
export function useStripeConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENT_CONFIG,
    queryFn: () => paymentService.getConfig(),
    staleTime: Infinity,
    retry: 1,
  })
}

/**
 * Opens a PaymentIntent for the current cart.
 *
 * Deliberately a mutation rather than a query: it has a server-side side
 * effect, and it must run at a precise moment in the checkout flow rather
 * than whenever a cache happens to go stale.
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (payload: CreatePaymentIntentPayload = {}) =>
      paymentService.createIntent(payload),
  })
}

/** Reads back a confirmed intent so the review step can show the real card. */
export function usePaymentIntent(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENT_INTENT, id],
    queryFn: () => paymentService.getIntent(id as string),
    enabled: !!id,
  })
}
