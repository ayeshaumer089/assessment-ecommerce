import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Check } from 'lucide-react'
import type { Product } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

interface Props {
  product: Product
  onAddToCart?: (product: Product) => void
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            className={
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-[11px] text-gray-400 leading-none">({count})</span>
    </div>
  )
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [added, setAdded] = useState(false)
  const hasDiscount = product.discountPercentage > 0
  const isLowStock = product.stock > 0 && product.stock <= 10
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || !onAddToCart) return
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <Link
        to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)}
        className="block relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
          }`}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-lg leading-none">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-700 text-white text-[11px] font-semibold rounded-lg leading-none">
              Out of stock
            </span>
          )}
        </div>
        {isLowStock && !isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 bg-amber-500 text-white text-[11px] font-semibold rounded-lg leading-none">
            Only {product.stock} left
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Category */}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 leading-none">
          {product.category}
        </span>

        {/* Name */}
        <Link
          to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)}
          className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        <StarRating rating={product.rating} count={product.reviewCount} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-gray-900 leading-none">
              {formatCurrency(product.discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through leading-none">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock pill */}
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full leading-none ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400'
                : isLowStock
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isOutOfStock ? 'Unavailable' : isLowStock ? `${product.stock} left` : 'In stock'}
          </span>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <Check size={15} />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}
