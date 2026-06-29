import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/services/cartService'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/store/toastStore'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useAuth } from '@/context/AuthContext'
import type { Product } from '@/types'

/** Fetches the server-side cart for a logged-in user. */
export function useServerCart(userId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.CART(userId),
    queryFn: () => cartService.getCart(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Primary cart hook for components.
 * Local Zustand store is the source of truth for UI state.
 * Server sync happens through mutations.
 */
export function useCart() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const store = useCartStore()

  const addMutation = useMutation({
    mutationFn: async ({ product, quantity }: { product: Product; quantity: number }) => {
      store.addItem(product, quantity) // optimistic update
      if (user) {
        await cartService.addToCart(Number(user.id), [
          { id: Number(product.id), quantity },
        ])
      }
      return product
    },
    onSuccess: (product) => {
      toast.success(`${product.name} added to cart`)
      if (user) queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART(Number(user.id)) })
    },
    onError: () => {
      toast.error('Could not add item to cart. Please try again.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      store.removeItem(productId)
      // Server sync: get current cart and replace without that product
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      store.updateQuantity(productId, quantity)
    },
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      store.clearCart()
    },
  })

  return {
    items: store.items,
    totalItems: store.totalItems(),
    totalPrice: store.totalPrice(),
    isEmpty: store.items.length === 0,

    addItem: (product: Product, quantity = 1) =>
      addMutation.mutateAsync({ product, quantity }),
    removeItem: (productId: string) => removeMutation.mutate(productId),
    updateQuantity: (productId: string, quantity: number) =>
      updateQuantityMutation.mutate({ productId, quantity }),
    clearCart: () => clearMutation.mutate(),

    isAdding: addMutation.isPending,
  }
}
