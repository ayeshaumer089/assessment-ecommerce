import api from './axiosInstance'
import type { Address, Order, OrderStatus, PaymentStatus, Product } from '@/types'

export interface CheckoutPayload {
  shippingAddress: Address
  paymentMethod: string
}

function mapAddress(data: any): Address {
  return {
    fullName: data?.fullName || '',
    phone: data?.phone || '',
    street: data?.street || '',
    apt: data?.apt || '',
    city: data?.city || '',
    state: data?.state || '',
    zipCode: data?.zipCode || '',
    country: data?.country || '',
  }
}

function mapOrder(data: any): Order {
  const items = (data.items || []).map((item: any) => {
    const productId =
      item.productId?._id || item.productId?.id || item.productId || ''
    const price = item.price ?? 0
    return {
      productId,
      name: item.name,
      quantity: item.quantity,
      price,
      product: {
        id: productId,
        _id: productId,
        name: item.name,
        price,
        description: '',
        image: item.image || '',
        category: '',
        stock: 0,
        discountPercentage: 0,
        discountedPrice: price,
        brand: '',
        sku: '',
        tags: [],
        rating: 0,
        reviewCount: 0,
        reviews: [],
        images: item.image ? [item.image] : [],
        availabilityStatus: '',
        shippingInformation: '',
        warrantyInformation: '',
        returnPolicy: '',
        createdAt: '',
      } as Product,
    }
  })

  const subtotal = data.subtotal ?? data.totalAmount ?? 0
  const shippingCost = data.shippingCost ?? 0
  const total = data.totalAmount ?? subtotal + shippingCost

  return {
    ...data,
    id: data._id || data.id,
    items,
    subtotal,
    discountedTotal: subtotal,
    shippingCost,
    total,
    totalAmount: data.totalAmount ?? total,
    paymentStatus: data.paymentStatus ?? 'pending',
    shippingAddress: mapAddress(data.shippingAddress),
    paymentMethod: data.paymentMethod || 'Card (mock)',
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

  async checkout(payload: CheckoutPayload): Promise<{ order: Order; payment: any }> {
    const { data } = await api.post<{ order: Order; payment: any }>(
      '/orders/create',
      payload,
    )
    return { order: mapOrder(data.order), payment: data.payment }
  },

  async cancelOrder(id: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/cancel`)
    return mapOrder(data)
  },

  // Admin functions
  async getAllOrders(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders/all')
    return data.map(mapOrder)
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
  ): Promise<Order> {
    const payload: any = { status }
    if (paymentStatus) payload.paymentStatus = paymentStatus
    const { data } = await api.patch<Order>(`/orders/${id}/status`, payload)
    return mapOrder(data)
  },
}
