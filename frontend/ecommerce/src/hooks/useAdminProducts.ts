import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/store/toastStore'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { productService } from '@/services/productService'
import type { Product } from '@/types'

interface AdminProductPayload {
  name: string
  description: string
  price: number
  category: string
  stock: number
  image?: string
  brand?: string
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AdminProductPayload): Promise<Product> => {
      return productService.createProduct(payload)
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PRODUCTS })
      toast.success(`"${newProduct.name}" created successfully`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create product')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<AdminProductPayload> & { id: string }): Promise<Product> => {
      return productService.updateProduct(id, payload)
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PRODUCTS })
      queryClient.setQueryData<Product>(QUERY_KEYS.PRODUCT(updated.id), updated)
      toast.success(`"${updated.name}" updated successfully`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update product')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return productService.deleteProduct(id)
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PRODUCTS })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.PRODUCT(deletedId) })
      toast.success('Product deleted')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete product')
    },
  })
}
