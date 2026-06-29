import { useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star, ShoppingCart, Minus, Plus, ChevronRight, Check,
  Truck, RotateCcw, ShieldCheck, Package, ArrowLeft,
  ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ErrorState from '@/components/ui/ErrorState'
import RecommendedProducts from '@/components/common/RecommendedProducts'

// ── Skeleton ─────────────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
      <div className="space-y-3">
        <div className="rounded-2xl bg-gray-200" style={{ aspectRatio: '1/1' }} />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded-full w-1/4" />
        <div className="h-8 bg-gray-200 rounded-xl w-5/6" />
        <div className="h-6 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-4 bg-gray-200 rounded-full w-1/2" />
        <div className="h-px bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-200 rounded-full w-full" />
          <div className="h-3 bg-gray-200 rounded-full w-4/5" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full mt-6" />
      </div>
    </div>
  )
}

// ── Star rating display ───────────────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={15}
            className={
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : i < rating
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-sm text-gray-400">({count} reviews)</span>
    </div>
  )
}

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  const prev = useCallback(
    () => setSelectedIdx((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  )
  const next = useCallback(
    () => setSelectedIdx((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  )

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 group">
        <div style={{ aspectRatio: '1/1' }}>
          <img
            key={selectedIdx}
            src={images[selectedIdx]}
            alt={`${name} — view ${selectedIdx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRightIcon size={18} />
            </button>
            {/* Dot indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === selectedIdx ? 'bg-indigo-600 w-4' : 'bg-white/70'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === selectedIdx
                  ? 'border-indigo-500 shadow-md shadow-indigo-100'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Quantity selector ─────────────────────────────────────────────────────────
function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="inline-flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>
      <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={15} />
      </button>
    </div>
  )
}

// ── Info badge row ────────────────────────────────────────────────────────────
function InfoBadges({
  shipping,
  warranty,
  returnPolicy,
}: {
  shipping: string
  warranty: string
  returnPolicy: string
}) {
  const items = [
    { icon: Truck, label: shipping || 'Fast shipping' },
    { icon: ShieldCheck, label: warranty || '1 year warranty' },
    { icon: RotateCcw, label: returnPolicy || '30 day returns' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100"
        >
          <Icon size={15} className="text-indigo-500 shrink-0 mt-0.5" />
          <span className="text-xs text-gray-600 leading-snug">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({
  reviewer,
  rating,
  comment,
  date,
}: {
  reviewer: string
  rating: number
  comment: string
  date: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs uppercase shrink-0">
            {reviewer[0]}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{reviewer}</p>
            <p className="text-[11px] text-gray-400">{formatDate(date)}</p>
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{comment}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError, refetch } = useProduct(id ?? '')
  const { addItem, isAdding } = useCart()
  const [qty, setQty] = useState(1)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const handleAddToCart = async () => {
    if (!product) return
    await addItem(product, qty)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2500)
  }

  const handleBuyNow = async () => {
    if (!product) return
    await addItem(product, qty)
    navigate(ROUTES.CUSTOMER.CART)
  }

  if (isLoading) return <ProductDetailSkeleton />
  if (isError || !product) {
    return (
      <ErrorState
        type="notFound"
        title="Product not found"
        description="This product may have been removed or doesn't exist."
        onRetry={() => refetch()}
        action={
          <Button variant="outline" onClick={() => navigate(ROUTES.CUSTOMER.PRODUCTS)}>
            Back to Products
          </Button>
        }
      />
    )
  }

  const images  = product.images?.length ? product.images : [product.image]
  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const savings   = product.price - product.discountedPrice
  const hasSaving = savings > 0.01

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link to={ROUTES.HOME} className="hover:text-gray-700 transition-colors">Home</Link>
        <ChevronRight size={13} />
        <Link to={ROUTES.CUSTOMER.PRODUCTS} className="hover:text-gray-700 transition-colors">Products</Link>
        <ChevronRight size={13} />
        <Link
          to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${product.category}`}
          className="hover:text-gray-700 transition-colors capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Image gallery */}
        <ImageGallery images={images} name={product.name} />

        {/* Product info */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
          {/* Category + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${product.category}`}
              className="text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
            >
              {product.category}
            </Link>
            {hasSaving && (
              <Badge
                label={`Save ${formatCurrency(savings)}`}
                variant="danger"
                size="sm"
              />
            )}
            {lowStock && !inStock && <Badge label="Out of Stock" variant="default" size="sm" />}
            {lowStock && inStock && <Badge label={`Only ${product.stock} left`} variant="warning" size="sm" dot />}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Meta — brand + SKU */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {product.brand && <span>Brand: <span className="font-medium text-gray-700">{product.brand}</span></span>}
            {product.sku && <span>SKU: <span className="font-mono text-xs text-gray-600">{product.sku}</span></span>}
          </div>

          {/* Rating */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.discountedPrice)}
            </span>
            {hasSaving && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm font-bold text-red-500">
                  -{Math.round(product.discountPercentage)}%
                </span>
              </div>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                !inStock ? 'bg-gray-400' : lowStock ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                !inStock ? 'text-gray-500' : lowStock ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {!inStock
                ? 'Out of stock'
                : lowStock
                  ? `Only ${product.stock} units left — order soon`
                  : `In stock (${product.stock} available)`}
            </span>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">About this product</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Quantity + Add to Cart */}
          {inStock ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <QuantitySelector
                  value={qty}
                  max={product.stock}
                  onChange={setQty}
                />
                {qty > 1 && (
                  <span className="text-sm text-gray-500">
                    = {formatCurrency(product.discountedPrice * qty)}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  fullWidth
                  loading={isAdding && !addedFeedback}
                  onClick={handleAddToCart}
                  leftIcon={addedFeedback ? <Check size={17} /> : <ShoppingCart size={17} />}
                  className={addedFeedback ? '!bg-emerald-600 hover:!bg-emerald-700' : ''}
                >
                  {addedFeedback ? 'Added to Cart!' : `Add to Cart`}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBuyNow}
                  className="shrink-0 px-6"
                >
                  Buy Now
                </Button>
              </div>

              {addedFeedback && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-sm text-emerald-700 font-medium">
                    Added to your cart!
                  </span>
                  <Link
                    to={ROUTES.CUSTOMER.CART}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    View Cart <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <Package size={20} className="text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500 font-medium">Currently out of stock</p>
              <p className="text-xs text-gray-400 mt-0.5">Check back soon or browse similar products</p>
            </div>
          )}

          {/* Info badges */}
          <InfoBadges
            shipping={product.shippingInformation}
            warranty={product.warrantyInformation}
            returnPolicy={product.returnPolicy}
          />

          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      {/* Reviews section */}
      {product.reviews.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Customer Reviews
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({product.reviews.length})
              </span>
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-gray-900">{product.rating.toFixed(1)}</span>
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {product.reviews.map((r, i) => (
              <ReviewCard
                key={i}
                reviewer={r.reviewerName}
                rating={r.rating}
                comment={r.comment}
                date={r.date}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      <div className="mt-16">
        <RecommendedProducts product={product} limit={4} />
      </div>
    </div>
  )
}
