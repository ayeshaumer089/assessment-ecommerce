import api from './axiosInstance'
import type { Cart, CartItem } from '@/types'

function mapCartItem(data: any): CartItem {
  return {
    ...data,
    productId: data.productId._id || data.productId.id || data.productId,
    product: {
      ...data.productId,
      id: data.productId._id || data.productId.id,
    },
  }
}

function mapCart(data: any): Cart {
  return {
    ...data,
    items: data.items.map(mapCartItem),
  }
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await api.get<Cart>('/cart')
    return mapCart(data)
  },

  async addItem(productId: string, quantity: number): Promise<Cart> {
    const { data } = await api.post<Cart>('/cart', { productId, quantity })
    return mapCart(data)
  },

  async updateItem(productId: string, quantity: number): Promise<Cart> {
    const { data } = await api.patch<Cart>(`/cart/${productId}`, { quantity })
    return mapCart(data)
  },

  async removeItem(productId: string): Promise<Cart> {
    const { data } = await api.delete<Cart>(`/cart/${productId}`)
    return mapCart(data)
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart')
  },
}
