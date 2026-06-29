import { describe, it, expect } from 'vitest'
import { getRecommendations } from '@/utils/recommendation'
import type { Product } from '@/types'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Test Product',
    description: 'A test product',
    price: 100,
    discountPercentage: 0,
    discountedPrice: 100,
    stock: 50,
    category: 'electronics',
    brand: 'TestBrand',
    sku: 'TEST-001',
    tags: [],
    rating: 4.0,
    reviewCount: 10,
    reviews: [],
    image: 'https://example.com/img.jpg',
    images: [],
    availabilityStatus: 'In Stock',
    shippingInformation: 'Ships in 1 day',
    warrantyInformation: '1 year',
    returnPolicy: '30 days',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const source = makeProduct({ id: 'source', category: 'electronics', discountedPrice: 100 })

describe('getRecommendations', () => {
  it('excludes the source product from results', () => {
    const candidates = [
      source,
      makeProduct({ id: '2', category: 'electronics', discountedPrice: 100 }),
    ]
    const results = getRecommendations(source, candidates)
    expect(results.every((p) => p.id !== source.id)).toBe(true)
  })

  it('returns products with matching category', () => {
    const same = makeProduct({ id: '2', category: 'electronics', discountedPrice: 500 })
    const other = makeProduct({ id: '3', category: 'clothing', discountedPrice: 500 })
    const results = getRecommendations(source, [same, other])
    // same category, any price → score 10; other category, price way off → score 0
    expect(results).toContainEqual(expect.objectContaining({ id: '2' }))
  })

  it('excludes products with score 0', () => {
    // Different category + price >120% away → score 0
    const unrelated = makeProduct({
      id: '2',
      category: 'clothing',
      discountedPrice: 1000,
    })
    const results = getRecommendations(source, [unrelated])
    expect(results).toHaveLength(0)
  })

  it('ranks same-category products above different-category products', () => {
    const sameCat   = makeProduct({ id: 'A', category: 'electronics', discountedPrice: 200 })
    const diffCat   = makeProduct({ id: 'B', category: 'clothing', discountedPrice: 105 })
    const results = getRecommendations(source, [diffCat, sameCat])
    expect(results[0].id).toBe('A') // same category wins
  })

  it('awards +6 for price within 20%', () => {
    // 115/100 = 15% → +6 price score, no category match → total 6 > 0
    const close = makeProduct({ id: '2', category: 'other', discountedPrice: 115 })
    const results = getRecommendations(source, [close])
    expect(results).toHaveLength(1)
  })

  it('tiebreaks by rating (higher rating first)', () => {
    const a = makeProduct({ id: 'A', category: 'electronics', discountedPrice: 105, rating: 3.0 })
    const b = makeProduct({ id: 'B', category: 'electronics', discountedPrice: 110, rating: 5.0 })
    const results = getRecommendations(source, [a, b])
    expect(results[0].id).toBe('B')
  })

  it('respects the limit parameter', () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      makeProduct({ id: String(i + 2), category: 'electronics', discountedPrice: 100 + i })
    )
    const results = getRecommendations(source, candidates, 3)
    expect(results).toHaveLength(3)
  })

  it('returns empty array when no candidates', () => {
    expect(getRecommendations(source, [])).toEqual([])
  })
})
