import api from './axiosInstance'
import type { DJCategory, DJProduct, DJProductsResponse } from '@/types/dummyjson'
import type { PaginatedResult, Product, ProductFilters } from '@/types'
import { mapProduct } from '@/utils/mappers'

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 20, category, sortBy, order = 'asc' } = filters

    const skip = (page - 1) * limit
    const params: Record<string, string | number> = { limit, skip }

    if (sortBy) {
      params.sortBy = sortBy === 'name' ? 'title' : sortBy
      params.order = order
    }

    const url = category ? `/products/category/${category}` : '/products'
    const { data } = await api.get<DJProductsResponse>(url, { params })

    return {
      items: data.products.map(mapProduct),
      total: data.total,
      page,
      limit,
      totalPages: Math.ceil(data.total / limit),
    }
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<DJProduct>(`/products/${id}`)
    return mapProduct(data)
  },

  async searchProducts(query: string, limit = 20): Promise<PaginatedResult<Product>> {
    const { data } = await api.get<DJProductsResponse>('/products/search', {
      params: { q: query, limit },
    })
    return {
      items: data.products.map(mapProduct),
      total: data.total,
      page: 1,
      limit,
      totalPages: Math.ceil(data.total / limit),
    }
  },

  async getCategories(): Promise<DJCategory[]> {
    const { data } = await api.get<DJCategory[]>('/products/categories')
    return data
  },

  async getProductsByCategory(
    category: string,
    filters: Omit<ProductFilters, 'category' | 'search'> = {},
  ): Promise<PaginatedResult<Product>> {
    return productService.getProducts({ ...filters, category })
  },
}
