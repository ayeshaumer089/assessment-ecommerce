import api from './axiosInstance'
import type { PaginatedResult, Product, ProductFilters } from '@/types'

function mapProduct(data: any): Product {
  // _id from lean() can be an ObjectId or Buffer object — convert to hex string
  const rawId = data._id
  let id: string
  if (typeof rawId === 'string') {
    id = rawId
  } else if (rawId && typeof rawId.toHexString === 'function') {
    id = rawId.toHexString()
  } else if (rawId && rawId.buffer) {
    // Buffer serialized as { type: 'Buffer', data: [...] }
    id = Buffer.from(rawId.buffer.data ?? rawId.buffer).toString('hex')
  } else {
    id = String(rawId)
  }

  return {
    ...data,
    id,
    _id: id,
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
    const { data } = await api.get<any>('/products', { params })
    // Interceptor preserves { data: [...], meta: {...} } from the envelope
    const rawItems: any[] = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
    const meta = data.meta
    const items = rawItems.map(mapProduct)
    const total = meta?.total ?? items.length
    const page = meta?.page ?? 1
    const limit = meta?.limit ?? 20
    const totalPages = meta?.totalPages ?? Math.ceil(total / limit)
    return {
      data: items,
      items,
      total,
      page,
      limit,
      totalPages,
      meta,
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
