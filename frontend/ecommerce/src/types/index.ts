export interface User {
  id: string
  name: string
  email: string
  username: string
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
  product: Product
  quantity: number
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  discountedTotal: number
  total: number
  status: OrderStatus
  shippingAddress: Address
  paymentMethod: string
  createdAt: string
  updatedAt: string
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
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
  sortBy?: 'price' | 'rating' | 'name'
  order?: 'asc' | 'desc'
}

export interface CreateOrderPayload {
  items: CartItem[]
  shippingAddress: Address
  paymentMethod: string
}
