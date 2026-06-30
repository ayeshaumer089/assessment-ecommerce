import { Link } from 'react-router-dom'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import { FREE_SHIPPING_THRESHOLD } from '@/constants/shipping'
import { formatCurrency } from '@/utils/formatters'
import type { Product } from '@/types'

// ── Trust / value props (mirrors shopzone.html perks) ─────────────────────────
const PERKS = [
  { icon: '🚚', title: 'Free shipping', desc: `On orders over $${FREE_SHIPPING_THRESHOLD}` },
  { icon: '🛡️', title: 'Secure payment', desc: '256-bit SSL checkout' },
  { icon: '↺', title: 'Easy returns', desc: '30-day money back' },
  { icon: '🎧', title: '24/7 support', desc: 'Here whenever you need' },
]

// Gradient classes cycled across category tiles (sz-c1 … sz-c5)
const CAT_GRADIENTS = ['sz-c1', 'sz-c2', 'sz-c3', 'sz-c4', 'sz-c5']

// Emoji per known category, with a sensible fallback
const CAT_EMOJI: Record<string, string> = {
  electronics: '⚡',
  clothing: '👕',
  'home-garden': '🪴',
  'home & garden': '🪴',
  books: '📚',
  sports: '🏅',
}
function categoryEmoji(slug: string, name: string): string {
  return CAT_EMOJI[slug] || CAT_EMOJI[name?.toLowerCase()] || '🛍'
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ heroProduct }: { heroProduct?: Product }) {
  return (
    <section className="sz-hero">
      <div className="sz-hero-grid">
        <div>
          <span className="sz-eyebrow">✨ New season, fresh arrivals</span>
          <h1>
            Everything you love,<br />
            <span className="sz-accent">all in one place.</span>
          </h1>
          <p className="sz-lede">
            Discover thousands of quality products at unbeatable prices, with
            fast delivery and hassle-free returns on every order.
          </p>
          <div className="sz-hero-ctas">
            <Link className="sz-btn-primary" to={ROUTES.CUSTOMER.PRODUCTS}>
              🛍 Shop Now
            </Link>
            <Link className="sz-btn-ghost" to={ROUTES.CUSTOMER.PRODUCTS}>
              Browse Categories →
            </Link>
          </div>
          <div className="sz-hero-stats">
            <div className="sz-stat">
              <div className="num">50K+</div>
              <div className="lbl">Products</div>
            </div>
            <div className="sz-stat">
              <div className="num">2M+</div>
              <div className="lbl">Customers</div>
            </div>
            <div className="sz-stat">
              <div className="num">4.9</div>
              <div className="lbl">Avg. rating</div>
            </div>
          </div>
        </div>

        {heroProduct ? (
          <Link
            className="sz-hero-card"
            to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', heroProduct.id)}
          >
            <span className="tag-top">★ Top rated</span>
            <div className="img-wrap">
              <img src={heroProduct.image} alt={heroProduct.name} />
            </div>
            <div className="sz-hero-card-body">
              <div className="cat">{heroProduct.category}</div>
              <h3>{heroProduct.name}</h3>
              <div className="sz-hero-card-foot">
                <span className="sz-price-lg">
                  {formatCurrency(heroProduct.discountedPrice)}
                </span>
                <span className="sz-view-link">View →</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="sz-hero-card" style={{ minHeight: 320 }} aria-hidden>
            <div className="img-wrap" style={{ background: '#2b1d63' }} />
            <div className="sz-hero-card-body">
              <div className="sz-skel" style={{ height: 14, width: '40%' }} />
              <div className="sz-skel" style={{ height: 20, width: '70%', marginTop: 8 }} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Perks ─────────────────────────────────────────────────────────────────────
function Perks() {
  return (
    <section className="sz-perks">
      <div className="sz-perks-grid">
        {PERKS.map((p) => (
          <div className="sz-perk" key={p.title}>
            <div className="ic">{p.icon}</div>
            <div>
              <div className="t">{p.title}</div>
              <div className="s">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Categories ────────────────────────────────────────────────────────────────
function Categories() {
  const { data: categories = [], isLoading } = useCategories()
  const shown = categories.slice(0, 5)

  return (
    <section className="sz-section" style={{ paddingBottom: 40 }}>
      <div className="sz-wrap" style={{ padding: 0 }}>
        <div className="sz-section-head">
          <div>
            <div className="kicker">Browse</div>
            <h2>Shop by category</h2>
            <p>Find exactly what you're looking for</p>
          </div>
          <Link className="sz-see-all" to={ROUTES.CUSTOMER.PRODUCTS}>
            All categories →
          </Link>
        </div>

        {isLoading ? (
          <div className="sz-cat-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sz-skel" style={{ height: 138 }} />
            ))}
          </div>
        ) : (
          <div className="sz-cat-grid">
            {shown.map((cat, i) => (
              <Link
                key={cat.slug}
                className="sz-cat-card"
                to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${cat.slug}`}
              >
                <div className={`sz-cat-ic ${CAT_GRADIENTS[i % CAT_GRADIENTS.length]}`}>
                  {categoryEmoji(cat.slug, cat.name)}
                </div>
                <h3>{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Featured product card (ShopZone style) ────────────────────────────────────
function FeaturedCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const isOutOfStock = product.stock === 0
  const rating = Math.round(product.rating || 0)
  const detailUrl = ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, 1)
  }

  return (
    <div className="sz-prod-card">
      <Link to={detailUrl} className="sz-prod-img">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="sz-prod-body">
        <div className="sz-prod-cat">{product.category}</div>
        <Link to={detailUrl}><h3>{product.name}</h3></Link>
        <div className="sz-prod-desc">{product.description}</div>
        <div className="sz-prod-rating">
          <span style={{ color: 'var(--gold)' }}>{'★'.repeat(rating)}</span>
          {'☆'.repeat(5 - rating)}
          <span className="rc">({product.reviewCount})</span>
        </div>
        <div className="sz-prod-foot">
          <span className="sz-price">{formatCurrency(product.discountedPrice)}</span>
          <span className={`sz-stock${isOutOfStock ? ' out' : ''}`}>
            {isOutOfStock ? 'Out of stock' : 'In stock'}
          </span>
        </div>
        <button className="sz-btn-cart" onClick={handleAdd} disabled={isOutOfStock}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  )
}

// ── Featured products ─────────────────────────────────────────────────────────
function FeaturedProducts() {
  const { data, isLoading } = useProducts({ limit: 8, sortBy: 'rating', order: 'desc' })
  const products = data?.items ?? []

  return (
    <section className="sz-section" style={{ paddingTop: 24 }}>
      <div className="sz-wrap" style={{ padding: 0 }}>
        <div className="sz-section-head">
          <div>
            <div className="kicker">Curated</div>
            <h2>Featured products</h2>
            <p>Top-rated picks loved by our customers</p>
          </div>
          <Link className="sz-see-all" to={ROUTES.CUSTOMER.PRODUCTS}>
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="sz-prod-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="sz-skel" style={{ height: 360 }} />
            ))}
          </div>
        ) : (
          <div className="sz-prod-grid">
            {products.map((product) => (
              <FeaturedCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── CTA band ──────────────────────────────────────────────────────────────────
function CtaBand() {
  return (
    <div className="sz-cta-band">
      <div>
        <h2>Ready to start shopping?</h2>
        <p>
          Join millions of happy customers and enjoy member-exclusive deals,
          free shipping, and more.
        </p>
      </div>
      <Link className="sz-btn-white" to={ROUTES.REGISTER}>
        Create free account →
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data } = useProducts({ limit: 1, sortBy: 'rating', order: 'desc' })
  const heroProduct = data?.items?.[0]

  return (
    <div className="sz-home">
      <Hero heroProduct={heroProduct} />
      <Perks />
      <Categories />
      <FeaturedProducts />
      <CtaBand />
    </div>
  )
}
