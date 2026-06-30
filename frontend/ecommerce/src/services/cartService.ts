import api from './axiosInstance'
import type { Cart, CartItem } from '@/types'

function mapCartItem(data: any): CartItem {
  const productData = typeof data.productId === 'object' ? data.productId : {}
  const productId = productData._id?.toString() || productData.id || data.productId?.toString() || ''
  const price = productData.price ?? data.price ?? 0
  return {
    ...data,
    productId,
    product: {
      ...productData,
      id: productId,
      _id: productId,
      price,
      // The cart populate returns a lean product (name/price/image/category/stock).
      // Fill the fields the storefront expects so totals never become NaN.
      discountPercentage: productData.discountPercentage ?? 0,
      discountedPrice: productData.discountedPrice ?? price,
      image: productData.image ?? '',
      stock: productData.stock ?? 0,
    },
  }
}

function mapCart(data: any): Cart {
  return {
    ...data,
    items: (data.items || []).map(mapCartItem),
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
