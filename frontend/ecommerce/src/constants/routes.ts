export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  CUSTOMER: {
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    PROFILE: '/profile',
  },

  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    PRODUCT_CREATE: '/admin/products/create',
    PRODUCT_EDIT: '/admin/products/:id/edit',
    ORDERS: '/admin/orders',
    ORDER_DETAIL: '/admin/orders/:id',
    CUSTOMERS: '/admin/customers',
    ANALYTICS: '/admin/analytics',
  },
} as const
