// Raw response types from https://dummyjson.com

export interface DJReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface DJProductMeta {
  createdAt: string
  updatedAt: string
  barcode: string
  qrCode: string
}

export interface DJProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand: string
  sku: string
  weight: number
  availabilityStatus: string
  shippingInformation: string
  warrantyInformation: string
  returnPolicy: string
  minimumOrderQuantity: number
  thumbnail: string
  images: string[]
  reviews: DJReview[]
  meta: DJProductMeta
}

export interface DJProductsResponse {
  products: DJProduct[]
  total: number
  skip: number
  limit: number
}

export interface DJCategory {
  slug: string
  name: string
  url: string
}

// Auth
export interface DJLoginPayload {
  username: string
  password: string
  expiresInMins?: number
}

export interface DJAuthResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  token: string
  refreshToken: string
}

// Cart
export interface DJCartProduct {
  id: number
  title: string
  price: number
  quantity: number
  total: number
  discountPercentage: number
  discountedTotal: number
  thumbnail: string
}

export interface DJCart {
  id: number
  products: DJCartProduct[]
  total: number
  discountedTotal: number
  userId: number
  totalProducts: number
  totalQuantity: number
}

export interface DJCartsResponse {
  carts: DJCart[]
  total: number
  skip: number
  limit: number
}

// User (for user list)
export interface DJUser {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  image: string
  role: string
  gender: string
  phone: string
  birthDate: string
}

export interface DJUsersResponse {
  users: DJUser[]
  total: number
  skip: number
  limit: number
}
