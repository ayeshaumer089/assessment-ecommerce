import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { Product } from '@/types'

export function useRecommendations(source: Product | null, limit = 4) {
  const query = useQuery({
    queryKey: QUERY_KEYS.RECOMMENDATIONS(source?.id || ''),
    queryFn: () => productService.getProductRecommendations(source?.id || '', limit),
    enabled: !!source?.id,
    staleTime: 1000 * 60 * 30,
  })

  return {
    recommendations: query.data || [],
    isLoading: query.isLoading,
  }
}
