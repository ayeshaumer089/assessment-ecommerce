import type { Product } from '@/types'

// ── Scoring weights ───────────────────────────────────────────────────────────
const CATEGORY_MATCH_SCORE = 10

// Each entry: [max ratio difference from reference price, points awarded]
// Ratio = |candidate - reference| / reference
const PRICE_BANDS: [number, number][] = [
  [0.20, 6],
  [0.40, 4],
  [0.60, 3],
  [0.80, 2],
  [1.20, 1],
]

// ── Internal helpers ──────────────────────────────────────────────────────────
function priceSimilarityScore(candidatePrice: number, referencePrice: number): number {
  if (referencePrice === 0) return 0
  const ratio = Math.abs(candidatePrice - referencePrice) / referencePrice
  for (const [threshold, score] of PRICE_BANDS) {
    if (ratio <= threshold) return score
  }
  return 0
}

function scoreCandidate(
  candidate: Product,
  referenceCategory: string,
  referencePrice: number,
): number {
  let score = 0
  if (candidate.category === referenceCategory) score += CATEGORY_MATCH_SCORE
  score += priceSimilarityScore(candidate.discountedPrice, referencePrice)
  return score
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Rank `candidates` by relevance to `source`, returning up to `limit` products.
 *
 * Scoring:
 *   - Same category            → +10
 *   - Price within 20%         → +6
 *   - Price within 40%         → +4
 *   - Price within 60%         → +3
 *   - Price within 80%         → +2
 *   - Price within 120%        → +1
 *
 * Only products with score > 0 are included.
 * Tiebreak: higher-rated products rank first.
 */
export function getRecommendations(
  source: Product,
  candidates: Product[],
  limit = 4,
): Product[] {
  const referencePrice    = source.discountedPrice
  const referenceCategory = source.category

  return candidates
    .filter((p) => p.id !== source.id)
    .map((p) => ({
      product: p,
      score:   scoreCandidate(p, referenceCategory, referencePrice),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.product.rating - a.product.rating
    })
    .slice(0, limit)
    .map(({ product }) => product)
}
