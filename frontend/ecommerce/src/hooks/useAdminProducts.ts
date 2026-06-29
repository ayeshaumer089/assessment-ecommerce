import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/store/toastStore'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { PaginatedResult, Product } from '@/types'

interface AdminProductPayload {
  name: string
  description: string
  price: number
  discountPercentage: number
  category: string
  stock: number
  brand?: string
}

function buildProduct(payload: AdminProductPayload, id: string): Product {
  const discountedPrice = parseFloat(
    (payload.price * (1 - payload.discountPercentage / 100)).toFixed(2),
  )
  return {
    id,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    discountPercentage: payload.discountPercentage,
    discountedPrice,
    stock: payload.stock,
    category: payload.category,
    brand: payload.brand ?? '',
    sku: '',
    tags: [],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    image: 'https://placehold.co/100x100/e0e7ff/6366f1?text=New',
    images: [],
    availabilityStatus: payload.stock > 0 ? 'In Stock' : 'Out of Stock',
    shippingInformation: '',
    warrantyInformation: '',
    returnPolicy: '',
    createdAt: new Date().toISOString(),
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AdminProductPayload): Promise<Product> => {
      const id = `local-${Date.now()}`
      return buildProduct(payload, id)
    },
    onSuccess: (newProduct) => {
      queryClient.setQueriesData<PaginatedResult<Product>>(
        { queryKey: QUERY_KEYS.PRODUCTS() },
        (old) => {
          if (!old) return old
          return { ...old, items: [newProduct, ...old.items], total: old.total + 1 }
        },
      )
      toast.success(`"${newProduct.name}" created successfully`)
    },
    onError: () => toast.error('Failed to create product'),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: AdminProductPayload & { id: string }): Promise<Product> => {
      return buildProduct(payload, id)
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<PaginatedResult<Product>>(
        { queryKey: QUERY_KEYS.PRODUCTS() },
        (old) => {
          if (!old) return old
          return { ...old, items: old.items.map((p) => (p.id === updated.id ? updated : p)) }
        },
      )
      queryClient.setQueryData<Product>(QUERY_KEYS.PRODUCT(updated.id), updated)
      toast.success(`"${updated.name}" updated successfully`)
    },
    onError: () => toast.error('Failed to update product'),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<string> => id,
    onSuccess: (deletedId) => {
      queryClient.setQueriesData<PaginatedResult<Product>>(
        { queryKey: QUERY_KEYS.PRODUCTS() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.filter((p) => p.id !== deletedId),
            total: Math.max(0, old.total - 1),
          }
        },
      )
      queryClient.removeQueries({ queryKey: QUERY_KEYS.PRODUCT(deletedId) })
      toast.success('Product deleted')
    },
    onError: () => toast.error('Failed to delete product'),
  })
}
