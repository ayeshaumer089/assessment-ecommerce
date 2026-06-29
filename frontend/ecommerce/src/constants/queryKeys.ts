export const QUERY_KEYS = {
  PRODUCTS: ['products'] as const,
  PRODUCT: (id: string) => ['products', id] as const,
  ORDERS: ['orders'] as const,
  ORDER: (id: string) => ['orders', id] as const,
  CUSTOMERS: ['customers'] as const,
  CUSTOMER: (id: string) => ['customers', id] as const,
  ANALYTICS: ['analytics'] as const,
  ME: ['me'] as const,
} as const
