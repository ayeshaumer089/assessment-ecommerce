import type { ProductFilters } from '@/types'

export const QUERY_KEYS = {
  // Products
  PRODUCTS: (filters?: ProductFilters) =>
    filters ? (['products', filters] as const) : (['products'] as const),
  PRODUCT: (id: string) => ['products', id] as const,
  SEARCH: (query: string) => ['products', 'search', query] as const,
  CATEGORIES: ['categories'] as const,

  // Orders
  ORDERS: (userId?: string) => userId ? (['orders', userId] as const) : (['orders'] as const),
  ORDER: (id: string) => ['orders', id] as const,

  // Cart
  CART: (userId: number) => ['cart', userId] as const,

  // Auth
  ME: ['me'] as const,

  // Admin
  CUSTOMERS: ['customers'] as const,
  ANALYTICS: ['analytics'] as const,
} as const
