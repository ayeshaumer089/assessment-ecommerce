import api from './axiosInstance'
import type { PaginatedResult, Product, ProductFilters } from '@/types'

function mapProduct(data: any): Product {
  // _id should now be a string from the backend, but handle ObjectId just in case
  const id = data.id || (data._id ? data._id.toString() : '')

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

// Sort fields the backend actually supports (see QueryProductDto on the API).
const VALID_SORT_FIELDS = ['price', 'name', 'createdAt', 'stock']

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const { order, sortBy, sortOrder, ...rest } = filters
    const params: any = { ...rest }

    // Only forward a sort the backend understands; otherwise omit it entirely
    // so the API's validation (forbidNonWhitelisted) doesn't reject the request.
    if (sortBy && VALID_SORT_FIELDS.includes(sortBy)) {
      params.sortBy = sortBy
      params.sortOrder = sortOrder || order || 'desc'
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
    // Prefer the live categories endpoint; fall back to a static list if it is
    // unavailable so the storefront filters keep working.
    try {
      const { data } = await api.get<any[]>('/categories')
      const list = Array.isArray(data) ? data : []
      if (list.length > 0) {
        return list.map((c) => ({ slug: c.slug, name: c.name }))
      }
    } catch {
      // ignore and use fallback
    }
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
