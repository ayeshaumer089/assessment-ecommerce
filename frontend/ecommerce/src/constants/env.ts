export const ENV = {
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api',
  APP_NAME: (import.meta.env.VITE_APP_NAME as string) || 'ShopSphere',
  // Optional: when unset the key is fetched from GET /payments/config, which
  // lets one bundle run against either a test or a live Stripe account.
  STRIPE_PUBLISHABLE_KEY:
    (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || '',
} as const
