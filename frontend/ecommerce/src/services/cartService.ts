import api from './axiosInstance'
import type { DJCart, DJCartsResponse } from '@/types/dummyjson'

export interface CartProductPayload {
  id: number
  quantity: number
}

export const cartService = {
  /** Fetch all carts for a given user */
  async getCart(userId: number): Promise<DJCart | null> {
    const { data } = await api.get<DJCartsResponse>(`/carts/user/${userId}`)
    return data.carts[0] ?? null
  },

  /** Create a new cart */
  async addToCart(userId: number, products: CartProductPayload[]): Promise<DJCart> {
    const { data } = await api.post<DJCart>('/carts/add', { userId, products })
    return data
  },

  /** Update an existing cart (merge = add/update products without removing others) */
  async updateCart(cartId: number, products: CartProductPayload[]): Promise<DJCart> {
    const { data } = await api.put<DJCart>(`/carts/${cartId}`, {
      products,
      merge: true,
    })
    return data
  },

  /** Replace cart products entirely (merge = false wipes existing) */
  async replaceCart(cartId: number, products: CartProductPayload[]): Promise<DJCart> {
    const { data } = await api.put<DJCart>(`/carts/${cartId}`, {
      products,
      merge: false,
    })
    return data
  },

  /** Delete (clear) a cart */
  async deleteCart(cartId: number): Promise<DJCart> {
    const { data } = await api.delete<DJCart>(`/carts/${cartId}`)
    return data
  },
}
