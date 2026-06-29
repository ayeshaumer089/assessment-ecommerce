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
    if (params.sortBy) {
      if (!params.sortOrder) params.sortOrder = params.order || 'desc'
    }
    const { data } = await api.get<PaginatedResult<Product>>('/products', { params })
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

  async searchProducts(query: string): Promise<PaginatedResult<Product>> {
    return this.getProducts({ search: query, limit: 100 })
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

  async getCategories(): Promise<{ slug: string; name: string }[]> {
    // Since our backend doesn't have a categories endpoint yet, return static from seed
    return [
      { slug: 'electronics', name: 'Electronics' },
      { slug: 'clothing', name: 'Clothing' },
      { slug: 'home-garden', name: 'Home & Garden' },
      { slug: 'books', name: 'Books' },
      { slug: 'sports', name: 'Sports' },
    ]
  },

  async getProductsByCategory(
    category: string,
    filters: Omit<ProductFilters, 'category' | 'search'> = {},
  ): Promise<PaginatedResult<Product>> {
    return this.getProducts({ ...filters, category })
  },

  // Admin functions
  async createProduct(product: Partial<Omit<Product, 'id' | '_id' | 'createdAt'>> & { name: string; description: string; price: number; category: string; stock: number }): Promise<Product> {
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
