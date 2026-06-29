import axiosInstance from './axiosInstance'
import type { ApiResponse, PaginatedResponse, Product } from '@/types'

interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
}

export const productService = {
  getAll: (params?: ProductFilters) =>
    axiosInstance.get<PaginatedResponse<Product>>('/products', { params }),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) =>
    axiosInstance.post<ApiResponse<Product>>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/products/${id}`),
}
