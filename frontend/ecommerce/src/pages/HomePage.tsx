import { Link } from 'react-router-dom'
import {
  ArrowRight, ShoppingBag, Truck, ShieldCheck, RotateCcw, Headphones,
  Star, Sparkles, ChevronRight, Tag,
} from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import { FREE_SHIPPING_THRESHOLD } from '@/constants/shipping'
import ProductCard from '@/components/common/ProductCard'
import ProductCardSkeleton from '@/components/common/ProductCardSkeleton'
import type { Product } from '@/types'

// ── Trust / value props ───────────────────────────────────────────────────────
const VALUE_PROPS = [
  { icon: Truck, title: 'Free shipping', desc: `On orders over $${FREE_SHIPPING_THRESHOLD}` },
  { icon: ShieldCheck, title: 'Secure payment', desc: '256-bit SSL checkout' },
  { icon: RotateCcw, title: 'Easy returns', desc: '30-day money back' },
  { icon: Headphones, title: '24/7 support', desc: 'Here whenever you need' },
]

// Soft gradient palette cycled across category tiles
const CATEGORY_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-rose-500 to-orange-400',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-blue-600',
  'from-amber-500 to-yellow-400',
  'from-fuchsia-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-purple-500 to-indigo-500',
]

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ heroProduct }: { heroProduct?: Product }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
      {/* Decorative blobs */}
      <span className="absolute -top-40 -left-32 w-[480px] h-[480px] bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <span className="absolute -bottom-32 right-0 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <span className="absolute top-1/3 left-1/2 w-72 h-72 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-100 text-xs font-medium backdrop-blur">
              <Sparkles size={13} className="text-amber-300" />
              New season, fresh arrivals
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Everything you love,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                all in one place.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-indigo-200/80 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Discover thousands of quality products at unbeatable prices, with
              fast delivery and hassle-free returns on every order.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                to={ROUTES.CUSTOMER.PRODUCTS}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 active:scale-[0.98] transition-all shadow-lg shadow-indigo-950/40"
              >
                <ShoppingBag size={17} />
                Shop Now
              </Link>
              <Link
                to={ROUTES.CUSTOMER.PRODUCTS}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/15 active:scale-[0.98] transition-all backdrop-blur"
              >
                Browse Categories
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[['50K+', 'Products'], ['2M+', 'Customers'], ['4.9', 'Avg. rating']].map(
                ([value, label]) => (
                  <div key={label} className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-white leading-none">{value}</p>
                    <p className="text-xs text-indigo-300 mt-1.5">{label}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Featured product card */}
          <div className="hidden lg:flex justify-center fade-up" style={{ animationDelay: '0.1s' }}>
            {heroProduct ? (
              <Link
                to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', heroProduct.id)}
                className="group relative w-full max-w-sm float-slow"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-400/30 to-violet-500/30 rounded-[2rem] blur-2xl" />
                <div className="relative bg-white rounded-3xl p-4 shadow-2xl shadow-indigo-950/50">
                  <div className="relative overflow-hidden rounded-2xl bg-gray-50" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold shadow">
                      <Star size={12} className="fill-amber-950" />
                      Top rated
                    </span>
                  </div>
                  <div className="px-2 pt-4 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                      {heroProduct.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-1">
                      {heroProduct.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${heroProduct.discountedPrice.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:gap-1.5 transition-all">
                        View <ChevronRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="w-full max-w-sm aspect-square rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Value props strip ─────────────────────────────────────────────────────────
function ValueProps() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Categories ────────────────────────────────────────────────────────────────
function Categories() {
  const { data: categories = [], isLoading } = useCategories()
  const shown = categories.slice(0, 8)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop by category</h2>
          <p className="text-sm text-gray-500 mt-1">Find exactly what you're looking for</p>
        </div>
        <Link
          to={ROUTES.CUSTOMER.PRODUCTS}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
        >
          All categories <ChevronRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((cat, i) => (
            <Link
              key={cat.slug}
              to={`${ROUTES.CUSTOMER.PRODUCTS}?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 h-24 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]} flex items-center justify-center text-white shadow-sm`}
              >
                <Tag size={16} />
              </span>
              <span className="text-sm font-semibold text-gray-800 capitalize group-hover:text-indigo-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Featured products ─────────────────────────────────────────────────────────
function FeaturedProducts() {
  const { data, isLoading } = useProducts({ limit: 8, sortBy: 'rating', order: 'desc' })
  const { addItem } = useCart()
  const products = data?.items ?? []

  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
            <p className="text-sm text-gray-500 mt-1">Top-rated picks loved by our customers</p>
          </div>
          <Link
            to={ROUTES.CUSTOMER.PRODUCTS}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => addItem(p, 1)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            to={ROUTES.CUSTOMER.PRODUCTS}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-colors"
          >
            View all products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Promo CTA band ────────────────────────────────────────────────────────────
function PromoBand() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-12 sm:px-12 sm:py-14 text-center sm:text-left">
        <span className="absolute -top-16 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <span className="absolute -bottom-20 -left-10 w-72 h-72 bg-violet-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to start shopping?
            </h2>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-md">
              Join millions of happy customers and enjoy member-exclusive deals,
              free shipping, and more.
            </p>
          </div>
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 active:scale-[0.98] transition-all shadow-lg shadow-indigo-900/30 shrink-0"
          >
            Create free account
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data } = useProducts({ limit: 1, sortBy: 'rating', order: 'desc' })
  const heroProduct = data?.items?.[0]

  return (
    <div>
      <Hero heroProduct={heroProduct} />
      <ValueProps />
      <Categories />
      <FeaturedProducts />
      <PromoBand />
    </div>
  )
}
