import type { CreateOrderPayload, Order, OrderStatus } from '@/types'
import { mockOrders } from '@/mock/orders'

const STORAGE_KEY = 'shopzone_orders'

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Order[]
  } catch {
    /* ignore */
  }
  // Seed with mock data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders))
  return mockOrders
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function generateId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

export const orderService = {
  async getOrders(userId?: string): Promise<Order[]> {
    const orders = loadOrders()
    return userId ? orders.filter((o) => o.userId === userId) : orders
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = loadOrders()
    return orders.find((o) => o.id === id) ?? null
  },

  async createOrder(userId: string, payload: CreateOrderPayload): Promise<Order> {
    const subtotal = payload.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    )
    const discountedTotal = payload.items.reduce(
      (sum, i) => sum + i.product.discountedPrice * i.quantity,
      0,
    )
    const now = new Date().toISOString()

    const order: Order = {
      id: generateId(),
      userId,
      items: payload.items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountedTotal: parseFloat(discountedTotal.toFixed(2)),
      total: parseFloat(discountedTotal.toFixed(2)),
      status: 'pending',
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
      createdAt: now,
      updatedAt: now,
    }

    const orders = loadOrders()
    saveOrders([order, ...orders])
    return order
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const orders = loadOrders()
    const idx = orders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error(`Order ${id} not found`)
    orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() }
    saveOrders(orders)
    return orders[idx]
  },

  async cancelOrder(id: string): Promise<Order> {
    return orderService.updateOrderStatus(id, 'cancelled')
  },
}
