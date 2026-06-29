import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import ProductCard from '@/components/common/ProductCard'
import ProductCardSkeleton from '@/components/common/ProductCardSkeleton'
import type { Product } from '@/types'

interface Props {
  product: Product
  limit?: number
}

export default function RecommendedProducts({ product, limit = 4 }: Props) {
  const { addItem }                     = useCart()
  const { recommendations, isLoading } = useRecommendations(product, limit)

  if (!isLoading && recommendations.length === 0) return null

  const categoryUrl = `${ROUTES.CUSTOMER.PRODUCTS}?category=${encodeURIComponent(product.category)}`

  return (
    <section aria-label="Recommended products">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none mb-0.5">
              Recommended For You
            </h2>
            <p className="text-sm text-gray-400">
              Based on category &amp; price range
            </p>
          </div>
        </div>

        <Link
          to={categoryUrl}
          className="shrink-0 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
        >
          See all in <span className="capitalize">{product.category}</span>
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: limit }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : recommendations.map((rec) => (
              <ProductCard
                key={rec.id}
                product={rec}
                onAddToCart={(p) => addItem(p)}
              />
            ))}
      </div>
    </section>
  )
}
