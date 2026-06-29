export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatar?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  rating: number
  reviewCount: number
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
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

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}
