export const ENV = {
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api',
  APP_NAME: (import.meta.env.VITE_APP_NAME as string) || 'ShopSphere',
} as const
