import { useMemo } from 'react'
import { useProductsByCategory, useProducts } from './useProducts'
import { getRecommendations } from '@/utils/recommendation'
import type { Product } from '@/types'

/**
 * Returns recommended products for a given source product.
 *
 * Fetches two pools in parallel:
 *   1. Same-category products  — primary signal for category relevance
 *   2. General catalog sample  — catches cross-category price-similar products
 *
 * Candidates are merged, deduplicated, then scored by the recommendation
 * algorithm (same category + price proximity).
 */
export function useRecommendations(source: Product | null, limit = 4) {
  const category = source?.category ?? ''

  const { data: catData, isLoading: catLoading } = useProductsByCategory(
    category,
    { limit: 20 },
  )

  // Supplement with general products for cross-category price matches
  const { data: generalData, isLoading: generalLoading } = useProducts({ limit: 20 })

  const recommendations = useMemo(() => {
    if (!source) return []

    // Merge pools, preserving order (category-first) and deduplicating
    const seen       = new Set<string>()
    const candidates: Product[] = []

    for (const p of [...(catData?.items ?? []), ...(generalData?.items ?? [])]) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        candidates.push(p)
      }
    }

    return getRecommendations(source, candidates, limit)
  }, [source, catData, generalData, limit])

  return {
    recommendations,
    isLoading: catLoading || generalLoading,
  }
}
