import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { ENV } from '@/config'
import { paymentService } from '@/services/paymentService'

/**
 * Stripe.js must be loaded exactly once per page — it injects a script tag and
 * registers global listeners. This module memoises the promise so remounting
 * the checkout never triggers a second load.
 */
let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise

  stripePromise = ENV.STRIPE_PUBLISHABLE_KEY
    ? loadStripe(ENV.STRIPE_PUBLISHABLE_KEY)
    : // No build-time key: ask the API which account this environment uses.
      paymentService
        .getConfig()
        .then((config) =>
          config.publishableKey ? loadStripe(config.publishableKey) : null,
        )
        .catch(() => null)

  return stripePromise
}

/**
 * Stripe Elements appearance mapped onto the app's existing design tokens, so
 * the hosted card inputs are visually indistinguishable from the surrounding
 * `.sz-field` form controls.
 */
export const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#5B3DF6',
    colorBackground: '#ffffff',
    colorText: '#161229',
    colorDanger: '#E53E3E',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '14.5px',
    borderRadius: '11px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #E7E3F0',
      borderRadius: '11px',
      padding: '12px 14px',
      fontSize: '14.5px',
      boxShadow: 'none',
      color: '#161229',
    },
    '.Input:focus': {
      border: '1px solid #5B3DF6',
      boxShadow: '0 0 0 3px rgba(91,61,246,0.12)',
      outline: 'none',
    },
    '.Input::placeholder': { color: '#B8B2CC' },
    '.Label': {
      fontSize: '13px',
      fontWeight: '700',
      color: '#161229',
      marginBottom: '7px',
    },
    '.Error': { fontSize: '12px', color: '#E53E3E', marginTop: '2px' },
    '.Tab': { border: '1px solid #E7E3F0', borderRadius: '11px' },
    '.Tab--selected': {
      border: '1px solid #5B3DF6',
      boxShadow: '0 0 0 3px rgba(91,61,246,0.12)',
    },
  },
}
