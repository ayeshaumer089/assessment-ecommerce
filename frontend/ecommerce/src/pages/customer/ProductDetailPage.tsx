import { useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star, ShoppingCart, Minus, Plus, ChevronRight, Check,
  Truck, RotateCcw, ShieldCheck, Package, ArrowLeft,
  ChevronLeft, ChevronRight as ChevronRightIcon, Sparkles,
} from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/utils/formatters'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import RecommendedProducts from '@/components/common/RecommendedProducts'

// ── Skeleton ─────────────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="sz-detail">
      <div className="sz-product-top" style={{ paddingTop: 0 }}>
        {/* gallery skel */}
        <div className="sz-skel" style={{ aspectRatio: '1/0.92', borderRadius: 24 }} />
        {/* info skel */}
        <div style={{ paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="sz-skel" style={{ height: 12, width: '30%', borderRadius: 8 }} />
          <div className="sz-skel" style={{ height: 38, width: '80%', borderRadius: 12 }} />
          <div className="sz-skel" style={{ height: 16, width: '50%', borderRadius: 8 }} />
          <div className="sz-skel" style={{ height: 34, width: '40%', borderRadius: 8 }} />
          <div className="sz-skel" style={{ height: 1, width: '100%', borderRadius: 1 }} />
          <div className="sz-skel" style={{ height: 12, width: '100%', borderRadius: 8 }} />
          <div className="sz-skel" style={{ height: 12, width: '90%', borderRadius: 8 }} />
          <div className="sz-skel" style={{ height: 12, width: '75%', borderRadius: 8 }} />
          <div className="sz-skel" style={{ height: 52, width: '100%', borderRadius: 100, marginTop: 12 }} />
        </div>
      </div>
    </div>
  )
}

// ── Star rating display ───────────────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="sz-rating-row">
      <span className="stars" style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            style={{
              fill: i < Math.floor(rating) ? '#FBBF24' : i < rating ? '#FDE68A' : '#D8D3E6',
              color: i < Math.floor(rating) ? '#FBBF24' : i < rating ? '#FBBF24' : '#D8D3E6',
            }}
          />
        ))}
      </span>
      <span className="score">{rating.toFixed(1)}</span>
      <span className="count">({count} reviews)</span>
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
    <div>
      {/* Main image */}
      <div className="sz-gallery">
        <img
          src={images[selectedIdx]}
          alt={`${name} — view ${selectedIdx + 1}`}
        />
        {images.length > 1 && (
          <>
            <button className="sz-gallery-nav-btn prev" onClick={prev} aria-label="Previous image">
              <ChevronLeft size={16} />
            </button>
            <button className="sz-gallery-nav-btn next" onClick={next} aria-label="Next image">
              <ChevronRightIcon size={16} />
            </button>
            <div className="sz-gallery-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`sz-gallery-dot${i === selectedIdx ? ' active' : ''}`}
                  onClick={() => setSelectedIdx(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="sz-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`sz-thumb${i === selectedIdx ? ' active' : ''}`}
              onClick={() => setSelectedIdx(i)}
              aria-label={`View image ${i + 1}`}
              style={{ padding: 0, background: 'none', border: '2px solid transparent' }}
            >
              <img src={src} alt={`${name} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
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
    <div className="sz-review-card">
      <div className="reviewer-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="avatar">{reviewer[0].toUpperCase()}</span>
          <div>
            <div className="reviewer-name">{reviewer}</div>
            <div className="reviewer-date">{formatDate(date)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              style={{
                fill: i < rating ? '#FBBF24' : '#D8D3E6',
                color: i < rating ? '#FBBF24' : '#D8D3E6',
              }}
            />
          ))}
        </div>
      </div>
      <p className="comment">{comment}</p>
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

  const images   = product.images?.length ? product.images : [product.image]
  const inStock  = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const savings  = product.price - product.discountedPrice
  const hasSaving = savings > 0.01

  const stockClass = !inStock ? 'sz-stock-row out' : lowStock ? 'sz-stock-row low' : 'sz-stock-row'
  const stockLabel = !inStock
    ? 'Out of stock'
    : lowStock
      ? `Only ${product.stock} units left — order soon`
      : `In stock (${product.stock} available)`

  return (
    <div className="sz-detail">

      {/* ── Breadcrumb ── */}
      <nav className="sz-breadcrumb">
        <Link to={ROUTES.HOME}>Home</Link>
        <span className="sep">›</span>
        <Link to={ROUTES.CUSTOMER.PRODUCTS}>Products</Link>
        <span className="sep">›</span>
        <Link
          to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${product.category}`}
          style={{ textTransform: 'capitalize' }}
        >
          {product.category}
        </Link>
        <span className="sep">›</span>
        <span className="current" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
      </nav>

      {/* ── Product top grid ── */}
      <div className="sz-product-top">

        {/* Gallery */}
        <ImageGallery images={images} name={product.name} />

        {/* Info panel */}
        <div className="sz-pinfo">

          {/* Category */}
          <Link
            to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${product.category}`}
            className="cat"
          >
            {product.category}
          </Link>

          {/* Title */}
          <h1>{product.name}</h1>

          {/* Rating */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Price */}
          <div className="sz-price-row">
            {formatCurrency(product.discountedPrice)}
            {hasSaving && (
              <>
                <span className="original">{formatCurrency(product.price)}</span>
                <span className="discount-badge">-{Math.round(product.discountPercentage)}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={stockClass}>
            <span className="sz-stock-dot" />
            {stockLabel}
          </div>

          {/* Meta */}
          {(product.brand || product.sku) && (
            <div className="sz-meta-row">
              {product.brand && <span>Brand: <b>{product.brand}</b></span>}
              {product.sku && <span>SKU: <b style={{ fontFamily: 'monospace', fontSize: 12 }}>{product.sku}</b></span>}
            </div>
          )}

          <hr className="sz-divider" />

          {/* Description */}
          <div className="sz-about-title">About this product</div>
          <div className="sz-about-text">{product.description}</div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="sz-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="sz-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity + Actions */}
          {inStock ? (
            <>
              <div className="sz-qty-row">
                <span className="sz-qty-label">Quantity</span>
                <div className="sz-qty-control">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qval">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    disabled={qty >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {qty > 1 && (
                  <span className="sz-qty-total">= {formatCurrency(product.discountedPrice * qty)}</span>
                )}
              </div>

              <div className="sz-action-row">
                <button
                  className={`sz-btn-cart-lg${addedFeedback ? ' added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAdding && !addedFeedback}
                >
                  {addedFeedback
                    ? <><Check size={17} /> Added to Cart!</>
                    : <><ShoppingCart size={17} /> Add to Cart</>
                  }
                </button>
                <button className="sz-btn-buy" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>

              {addedFeedback && (
                <div className="sz-added-banner">
                  <span className="msg">✓ Added to your cart!</span>
                  <Link to={ROUTES.CUSTOMER.CART} className="link">
                    View Cart <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="sz-oos-panel">
              <div className="icon"><Package size={22} /></div>
              <p>Currently out of stock</p>
              <small>Check back soon or browse similar products</small>
            </div>
          )}

          {/* Perks */}
          <div className="sz-perk-row">
            <div className="sz-perk-mini">
              <span className="ic"><Truck size={15} /></span>
              {product.shippingInformation || 'Fast shipping'}
            </div>
            <div className="sz-perk-mini">
              <span className="ic"><ShieldCheck size={15} /></span>
              {product.warrantyInformation || '1 year warranty'}
            </div>
            <div className="sz-perk-mini">
              <span className="ic"><RotateCcw size={15} /></span>
              {product.returnPolicy || '30 day returns'}
            </div>
          </div>

          {/* Back */}
          <button className="sz-back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      {/* ── Reviews ── */}
      {product.reviews.length > 0 && (
        <section className="sz-reviews">
          <div className="sz-reviews-head">
            <h2>Customer Reviews <span style={{ fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#9A93AE' }}>({product.reviews.length})</span></h2>
            <div className="avg">
              {product.rating.toFixed(1)}
              <Star size={20} style={{ fill: '#FBBF24', color: '#FBBF24' }} />
            </div>
          </div>
          <div className="sz-review-grid">
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

      {/* ── Recommendations ── */}
      <div className="sz-rec-section">
        <div className="sz-rec-head">
          <div className="sz-rec-head-left">
            <div className="sz-rec-ic"><Sparkles size={18} /></div>
            <div>
              <h2>Recommended for you</h2>
              <p>Based on category &amp; price range</p>
            </div>
          </div>
          <Link
            to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${product.category}`}
            className="sz-see-all"
          >
            See all in {product.category} →
          </Link>
        </div>
        <RecommendedProducts product={product} limit={4} />
      </div>

    </div>
  )
}
