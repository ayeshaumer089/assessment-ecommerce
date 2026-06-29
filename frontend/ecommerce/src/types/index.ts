export interface User {
  id: string
  _id?: string
  name: string
  email: string
  username?: string
  role: 'customer' | 'admin'
  avatar?: string
  createdAt: string
}

export interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

export interface Product {
  id: string
  _id?: string
  name: string
  description: string
  price: number
  discountPercentage: number
  discountedPrice: number
  stock: number
  category: string
  brand: string
  sku: string
  tags: string[]
  rating: number
  reviewCount: number
  reviews: Review[]
  image: string
  images: string[]
  availabilityStatus: string
  shippingInformation: string
  warrantyInformation: string
  returnPolicy: string
  createdAt: string
}

export interface CartItem {
  _id?: string
  productId?: string
  product: Product
  quantity: number
  price?: number
}

export interface Cart {
  _id?: string
  userId: string
  items: CartItem[]
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  productId?: string
  name?: string
  quantity: number
  price?: number
  product?: Product
}

export interface Order {
  id: string
  _id?: string
  userId: string
  items: OrderItem[]
  totalAmount?: number
  total?: number
  subtotal?: number
  discountedTotal?: number
  status: OrderStatus
  paymentStatus?: PaymentStatus
  shippingAddress?: Address
  paymentMethod?: string
  createdAt: string
  updatedAt?: string
  // Compatibility with old UI:
  // Calculate total from totalAmount if missing
  get total(): number {
    return this.totalAmount || 0
  }
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export interface PaginatedResult<T> {
  data: T[]
  items?: T[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  order?: 'asc' | 'desc'
}

export interface CreateOrderPayload {
  items: CartItem[]
  shippingAddress: Address
  paymentMethod: string
}

// Dashboard Types
export interface DashboardOverview {
  totalUsers: number
  totalProducts: number
  outOfStock: number
  totalOrders: number
  totalRevenue: number
  thisMonth: { orders: number; revenue: number }
  lastMonth: { orders: number; revenue: number }
  growth: { orders: number | null; revenue: number | null }
}

export interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: string
  name: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

export interface StatusBreakdown {
  status: string
  count: number
  percentage: number
}

export interface DashboardStats {
  overview: DashboardOverview
  charts: {
    sales: SalesDataPoint[]
    orderStatus: StatusBreakdown[]
    topProducts: TopProduct[]
  }
  recentOrders: Order[]
}
