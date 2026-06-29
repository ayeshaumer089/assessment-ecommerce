import { create } from 'zustand'
import type { Cart, CartItem, Product } from '@/types'
import { cartService } from '@/services/cartService'

interface CartState {
  cart: Cart | null
  items: CartItem[]
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (productOrId: Product | string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const cart = await cartService.getCart()
      const items = cart.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          id: (item.product.id || item.product._id) as string,
        },
      }))
      set({ cart, items, isLoading: false })
    } catch {
      set({ cart: null, items: [], isLoading: false })
    }
  },

  addItem: async (productOrId, quantity = 1) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId.id
    const cart = await cartService.addItem(productId, quantity)
    const items = cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        id: (item.product.id || item.product._id) as string,
      },
    }))
    set({ cart, items })
  },

  removeItem: async (productId) => {
    const cart = await cartService.removeItem(productId)
    const items = cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        id: (item.product.id || item.product._id) as string,
      },
    }))
    set({ cart, items })
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(productId)
      return
    }
    const cart = await cartService.updateItem(productId, quantity)
    const items = cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        id: (item.product.id || item.product._id) as string,
      },
    }))
    set({ cart, items })
  },

  clearCart: async () => {
    await cartService.clearCart()
    set({ cart: null, items: [] })
  },

  totalItems: () => {
    return get().items.reduce((acc, i) => acc + i.quantity, 0)
  },

  totalPrice: () => {
    return get().items.reduce((acc, i) => acc + ((i.product?.price || i.price) || 0) * i.quantity, 0)
  },
}))
