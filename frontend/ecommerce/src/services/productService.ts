import api from './axiosInstance'
import type { PaginatedResult, Product, ProductFilters } from '@/types'

function mapProduct(data: any): Product {
  return {
    ...data,
    id: data._id || data.id,
    discountPercentage: data.discountPercentage || 0,
    discountedPrice: data.discountedPrice || data.price,
    brand: data.brand || '',
    sku: data.sku || '',
    tags: data.tags || [],
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    reviews: data.reviews || [],
    images: data.images || [data.image],
    availabilityStatus: data.availabilityStatus || 'In Stock',
    shippingInformation: data.shippingInformation || '',
    warrantyInformation: data.warrantyInformation || '',
    returnPolicy: data.returnPolicy || '',
  }
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const params: any = { ...filters }
    const { data } = await api.get<any>('/products', { params })
    const items = (data.data || data.items || []).map(mapProduct)
    const total = data.meta?.total || data.total || items.length
    const page = data.meta?.page || data.page || 1
    const limit = data.meta?.limit || data.limit || 20
    const totalPages = data.meta?.totalPages || data.totalPages || Math.ceil(total / limit)
    return {
      data: items,
      items,
      total,
      page,
      limit,
      totalPages,
      meta: data.meta,
    }
  },

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const params = limit ? { limit } : {}
    const { data } = await api.get<Product[]>('/products/featured', { params })
    return data.map(mapProduct)
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`)
    return mapProduct(data)
  },

  async getProductRecommendations(id: string, limit?: number): Promise<Product[]> {
    const params = limit ? { limit } : {}
    const { data } = await api.get<Product[]>(`/products/${id}/recommendations`, { params })
    return data.map(mapProduct)
  },

  // Admin functions
  async createProduct(product: Omit<Product, 'id' | '_id' | 'createdAt'>): Promise<Product> {
    const { data } = await api.post<Product>('/products', product)
    return mapProduct(data)
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, product)
    return mapProduct(data)
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}
