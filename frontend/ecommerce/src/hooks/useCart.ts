import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/services/cartService'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/store/toastStore'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useAuth } from '@/context/AuthContext'
import type { Product } from '@/types'

/** Fetches the server-side cart for a logged-in user. */
export function useServerCart() {
  const { isAuthenticated } = useAuth()
  const store = useCartStore()
  return useQuery({
    queryKey: QUERY_KEYS.CART,
    queryFn: async () => {
      await store.fetchCart()
      return store.cart
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Primary cart hook for components.
 */
export function useCart() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const store = useCartStore()

  const addMutation = useMutation({
    mutationFn: async ({ product, quantity }: { product: Product; quantity: number }) => {
      if (isAuthenticated) {
        await store.addItem(product.id, quantity)
      } else {
        // Fallback to local if not logged in?
        // For now, we require login to use cart (as per backend)
        throw new Error('Please log in to add items to cart')
      }
      return product
    },
    onSuccess: (product) => {
      toast.success(`${product.name} added to cart`)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Could not add item to cart. Please try again.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (isAuthenticated) {
        await store.removeItem(productId)
      }
    },
    onSuccess: () => {
      toast.success('Item removed from cart')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART })
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (isAuthenticated) {
        if (quantity <= 0) {
          await store.removeItem(productId)
        } else {
          await store.updateQuantity(productId, quantity)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART })
    },
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        await store.clearCart()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART })
    },
  })

  return {
    items: store.items,
    totalItems: store.totalItems(),
    totalPrice: store.totalPrice(),
    isEmpty: store.items.length === 0,
    isLoading: store.isLoading,

    addItem: (product: Product, quantity = 1) =>
      addMutation.mutateAsync({ product, quantity }),
    removeItem: (productId: string) => removeMutation.mutate(productId),
    updateQuantity: (productId: string, quantity: number) =>
      updateQuantityMutation.mutate({ productId, quantity }),
    clearCart: () => clearMutation.mutate(),

    isAdding: addMutation.isPending,
  }
}
