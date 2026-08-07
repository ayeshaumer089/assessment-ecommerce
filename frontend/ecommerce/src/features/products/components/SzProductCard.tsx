import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TextStarRating } from '@/common/components'
import { formatCurrency } from '@/utils'
import { ROUTES } from '@/constants'
import type { Product } from '@/types'

interface Props {
  product: Product
  onAddToCart: (product: Product) => void
  /**
   * `catalog` is the full-featured listing card (badges, discounts, low-stock
   * hints, add-to-cart confirmation). `featured` is the trimmed-down variant
   * used on the home page.
   */
  variant?: 'catalog' | 'featured'
}

/** ShopZone-styled product card shared by the home page and product listing. */
export default function SzProductCard({ product, onAddToCart, variant = 'catalog' }: Props) {
  const [added, setAdded] = useState(false)

  const isCatalog = variant === 'catalog'
  const hasDiscount = product.discountPercentage > 0
  const isLowStock = product.stock > 0 && product.stock <= 10
  const isOutOfStock = product.stock === 0
  const detailUrl = ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    onAddToCart(product)
    if (!isCatalog) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="sz-prod-card">
      <Link
        to={detailUrl}
        className={`sz-prod-img${isCatalog && isOutOfStock ? ' dim' : ''}`}
      >
        <img src={product.image} alt={product.name} loading="lazy" />
        {isCatalog && (
          <>
            <div className="sz-prod-badges">
              {hasDiscount && (
                <span className="sz-prod-badge disc">-{Math.round(product.discountPercentage)}%</span>
              )}
              {isOutOfStock && <span className="sz-prod-badge oos">Out of stock</span>}
            </div>
            {isLowStock && !isOutOfStock && (
              <span className="sz-prod-badge-low">Only {product.stock} left</span>
            )}
          </>
        )}
      </Link>

      <div className="sz-prod-body">
        <div className="sz-prod-cat">{product.category}</div>
        <Link to={detailUrl}><h3>{product.name}</h3></Link>
        <div className="sz-prod-desc">{product.description}</div>

        <TextStarRating rating={product.rating} count={product.reviewCount} />

        <div className="sz-prod-foot">
          {isCatalog ? (
            <span>
              <span className="sz-price">{formatCurrency(product.discountedPrice)}</span>
              {hasDiscount && (
                <span className="sz-price-old">{formatCurrency(product.price)}</span>
              )}
            </span>
          ) : (
            <span className="sz-price">{formatCurrency(product.discountedPrice)}</span>
          )}
          <span className={`sz-stock${isOutOfStock ? ' out' : ''}`}>
            {isOutOfStock
              ? 'Out of stock'
              : isCatalog && isLowStock
                ? `${product.stock} left`
                : 'In stock'}
          </span>
        </div>

        <button
          className={`sz-btn-cart${added ? ' added' : ''}`}
          onClick={handleAdd}
          disabled={isOutOfStock}
        >
          {added ? '✓ Added' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  )
}
