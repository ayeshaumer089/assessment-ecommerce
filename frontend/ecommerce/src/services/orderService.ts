import axiosInstance from './axiosInstance'
import type { Address, ApiResponse, Order, PaginatedResponse } from '@/types'

interface CreateOrderPayload {
  items: { productId: string; quantity: number }[]
  shippingAddress: Address
}

export const orderService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    axiosInstance.get<PaginatedResponse<Order>>('/orders', { params }),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`),

  create: (data: CreateOrderPayload) =>
    axiosInstance.post<ApiResponse<Order>>('/orders', data),

  updateStatus: (id: string, status: Order['status']) =>
    axiosInstance.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status }),
}
