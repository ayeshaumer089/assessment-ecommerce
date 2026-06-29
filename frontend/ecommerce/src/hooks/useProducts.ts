import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { ProductFilters } from '@/types'

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filters),
    queryFn: () => productService.getProducts(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })
}

export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id),
    queryFn: () => productService.getProductById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
  })
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH(query),
    queryFn: () => productService.searchProducts(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 60, // categories rarely change
  })
}

export function useProductsByCategory(category: string, filters: Omit<ProductFilters, 'category' | 'search'> = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS({ ...filters, category }),
    queryFn: () => productService.getProductsByCategory(category, filters),
    enabled: !!category,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })
}
