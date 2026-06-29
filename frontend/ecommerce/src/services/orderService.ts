import api from './axiosInstance'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

function mapOrder(data: any): Order {
  return {
    ...data,
    id: data._id || data.id,
  }
}

export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders')
    return data.map(mapOrder)
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`)
    return mapOrder(data)
  },

  async checkout(): Promise<{ order: Order; payment: any }> {
    const { data } = await api.post<{ order: Order; payment: any }>('/orders/create', {})
    return { order: mapOrder(data.order), payment: data.payment }
  },

  async cancelOrder(id: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/cancel`)
    return mapOrder(data)
  },

  // Admin functions
  async getAllOrders(): Promise<{ data: Order[]; total: number }> {
    const { data } = await api.get<{ data: Order[]; total: number }>('/orders/all')
    return { data: data.data.map(mapOrder), total: data.total }
  },

  async updateOrderStatus(id: string, status: OrderStatus, paymentStatus?: PaymentStatus): Promise<Order> {
    const payload: any = { status }
    if (paymentStatus) payload.paymentStatus = paymentStatus
    const { data } = await api.patch<Order>(`/orders/${id}/status`, payload)
    return mapOrder(data)
  },
}
