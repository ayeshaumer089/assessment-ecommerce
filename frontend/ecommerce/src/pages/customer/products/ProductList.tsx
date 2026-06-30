import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, LayoutGrid,
} from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useDebounce } from '@/hooks/useDebounce'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'
import type { Product, ProductFilters } from '@/types'

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'default',    label: 'Relevance'         },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest'            },
]

const PRICE_RANGES = [
  { label: 'All prices',   min: 0,    max: Infinity },
  { label: 'Under $50',    min: 0,    max: 50       },
  { label: '$50 – $200',   min: 50,   max: 200      },
  { label: '$200 – $500',  min: 200,  max: 500      },
  { label: '$500+',        min: 500,  max: Infinity },
]

// Map the UI sort option → backend query params (sortBy + sortOrder)
function toApiSort(sort: string): Pick<ProductFilters, 'sortBy' | 'sortOrder'> {
  switch (sort) {
    case 'price_asc':  return { sortBy: 'price',     sortOrder: 'asc'  }
    case 'price_desc': return { sortBy: 'price',     sortOrder: 'desc' }
    case 'newest':     return { sortBy: 'createdAt', sortOrder: 'desc' }
    default:           return {}
  }
}

// Apply the price-range filter client-side after the server response.
function applyClientFilters(
  items: Product[],
  priceMin: number,
  priceMax: number,
): Product[] {
  if (priceMin > 0 || priceMax < Infinity) {
    return items.filter(
      (p) => p.discountedPrice >= priceMin && p.discountedPrice <= priceMax,
    )
  }
  return items
}

// ── ShopZone product card (full-featured, scoped styling) ────────────────────
function SzProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (p: Product) => void
}) {
  const [added, setAdded] = useState(false)
  const hasDiscount = product.discountPercentage > 0
  const isLowStock = product.stock > 0 && product.stock <= 10
  const isOutOfStock = product.stock === 0
  const rating = Math.round(product.rating || 0)
  const detailUrl = ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="sz-prod-card">
      <Link to={detailUrl} className={`sz-prod-img${isOutOfStock ? ' dim' : ''}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="sz-prod-badges">
          {hasDiscount && (
            <span className="sz-prod-badge disc">-{Math.round(product.discountPercentage)}%</span>
          )}
          {isOutOfStock && <span className="sz-prod-badge oos">Out of stock</span>}
        </div>
        {isLowStock && !isOutOfStock && (
          <span className="sz-prod-badge-low">Only {product.stock} left</span>
        )}
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
          <span>
            <span className="sz-price">{formatCurrency(product.discountedPrice)}</span>
            {hasDiscount && (
              <span className="sz-price-old">{formatCurrency(product.price)}</span>
            )}
          </span>
          <span className={`sz-stock${isOutOfStock ? ' out' : ''}`}>
            {isOutOfStock ? 'Out of stock' : isLowStock ? `${product.stock} left` : 'In stock'}
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

// ── Filter panel (sidebar / drawer) ─────────────────────────────────────────
interface FilterPanelProps {
  categories: { slug: string; name: string }[]
  selectedCategory: string
  priceRange: string
  onCategory: (v: string) => void
  onPriceRange: (v: string) => void
  onReset: () => void
  activeCount: number
}

function FilterPanel({
  categories,
  selectedCategory,
  priceRange,
  onCategory,
  onPriceRange,
  onReset,
  activeCount,
}: FilterPanelProps) {
  return (
    <>
      {/* Header */}
      <div className="sz-sidebar-title" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span className="ic"><SlidersHorizontal size={15} /></span>
          Filters
          {activeCount > 0 && (
            <span
              style={{
                background: 'var(--violet)', color: '#fff', fontSize: 11, fontWeight: 700,
                borderRadius: 999, padding: '1px 7px', lineHeight: 1.6,
              }}
            >
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button className="sz-clear-all" onClick={onReset}>Clear all</button>
        )}
      </div>

      {/* Category */}
      <div className="sz-filter-group">
        <div className="sz-filter-label">Category</div>
        <div className="sz-filter-list">
          <button
            className={`sz-filter-item${selectedCategory === '' ? ' active' : ''}`}
            onClick={() => onCategory('')}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`sz-filter-item${selectedCategory === cat.slug ? ' active' : ''}`}
              onClick={() => onCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="sz-filter-group">
        <div className="sz-filter-label">Price range</div>
        <div className="sz-filter-list">
          {PRICE_RANGES.map((range, i) => {
            const key = String(i)
            return (
              <button
                key={key}
                className={`sz-filter-item${priceRange === key ? ' active' : ''}`}
                onClick={() => onPriceRange(key)}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPage: (p: number) => void
}

function Pagination({ page, totalPages, total, limit, onPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * limit + 1
  const end   = Math.min(page * limit, total)

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-[var(--line)]">
      <p className="text-sm text-[var(--ink-soft)]">
        Showing <span className="font-semibold text-[var(--ink)]">{start}–{end}</span> of{' '}
        <span className="font-semibold text-[var(--ink)]">{total}</span> products
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[#F5F3FA] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} /> Prev
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-[var(--violet)] text-white'
                  : 'text-[var(--ink-soft)] hover:bg-[#F5F3FA]'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[#F5F3FA] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Read filter state from URL
  const rawSearch   = searchParams.get('q')         ?? ''
  const category    = searchParams.get('category')  ?? ''
  const sort        = searchParams.get('sort')      ?? 'default'
  const priceRange  = searchParams.get('price')     ?? '0'
  const page        = Math.max(1, Number(searchParams.get('page') ?? '1'))

  const debouncedSearch = useDebounce(rawSearch, 400)
  const isSearching     = debouncedSearch.trim().length > 1

  const { min: priceMin, max: priceMax } = PRICE_RANGES[Number(priceRange)] ?? PRICE_RANGES[0]

  // Build API params — search, category, sort and pagination all go to
  // the same backend call so they compose correctly (search + category etc.)
  const apiFilters: ProductFilters = {
    page,
    limit: PAGE_SIZE,
    category: category || undefined,
    search: isSearching ? debouncedSearch : undefined,
    ...toApiSort(sort),
  }

  const browseQuery     = useProducts(apiFilters)
  const categoriesQuery = useCategories()

  const categoriesData = categoriesQuery.data ?? []
  const catsLoading    = categoriesQuery.isLoading

  const { data, isLoading, isError, refetch } = browseQuery

  // Apply client-side price filter after the server response
  const filteredItems = useMemo(
    () => applyClientFilters(data?.items ?? [], priceMin, priceMax),
    [data?.items, priceMin, priceMax],
  )

  const totalPages    = data?.totalPages ?? 1
  const displayedItems = filteredItems

  // URL param helpers
  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  const resetFilters = () => {
    setSearchParams({ q: rawSearch })
    setDrawerOpen(false)
  }

  const activeFilterCount = Number(!!category) + Number(priceRange !== '0')

  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sz-home">
      {/* Page header */}
      <div className="sz-page-head">
        <h1>Products</h1>
        <p>{isLoading ? 'Loading…' : `${data?.total ?? filteredItems.length} items available`}</p>
      </div>

      <div className="flex gap-7">
        {/* ── Desktop filter sidebar ────────────────────────────────── */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sz-sidebar sticky top-24">
            <FilterPanel
              categories={categoriesData}
              selectedCategory={category}
              priceRange={priceRange}
              onCategory={(v) => setParam('category', v)}
              onPriceRange={(v) => setParam('price', v === '0' ? '' : v)}
              onReset={resetFilters}
              activeCount={activeFilterCount}
            />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Search + sort + mobile filter button */}
          <div className="sz-toolbar">
            <div className="sz-search-bar">
              <Search size={16} className="shrink-0" />
              <input
                type="search"
                value={rawSearch}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="Search products…"
              />
              {rawSearch && (
                <button className="clr" onClick={() => setParam('q', '')} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              className="sz-sort-select"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button className="sz-filter-btn lg:hidden" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && <span className="cnt">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Active filter chips */}
          {(category || priceRange !== '0') && (
            <div className="sz-chips">
              {category && (
                <span className="sz-chip">
                  {category}
                  <button onClick={() => setParam('category', '')} aria-label="Remove category filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              {priceRange !== '0' && (
                <span className="sz-chip">
                  {PRICE_RANGES[Number(priceRange)]?.label}
                  <button onClick={() => setParam('price', '')} aria-label="Remove price filter">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Search mode banner */}
          {isSearching && (
            <div className="sz-banner">
              <p>
                Results for <span style={{ fontWeight: 700 }}>"{debouncedSearch}"</span>
                {(data?.total ?? 0) > 0 && ` — ${data!.total} found`}
              </p>
              <button onClick={() => setParam('q', '')}>Clear search</button>
            </div>
          )}

          {/* Grid */}
          {isError ? (
            <ErrorState type="network" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="sz-products-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="sz-skel" style={{ height: 360 }} />
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <EmptyState
              icon={<LayoutGrid size={32} />}
              title="No products found"
              description={
                isSearching
                  ? `No results for "${debouncedSearch}". Try a different keyword.`
                  : 'Try adjusting your filters.'
              }
              action={
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-[var(--violet)] border border-[#DFD7F4] rounded-full hover:bg-[var(--violet-tint)]"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="sz-products-grid">
              {displayedItems.map((product) => (
                <SzProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && displayedItems.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={data?.total ?? 0}
              limit={PAGE_SIZE}
              onPage={(p) => setParam('page', String(p))}
            />
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl flex flex-col lg:hidden">
            <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--line)] shrink-0">
              <h3 className="font-semibold text-[var(--ink)]">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {catsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-9 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <FilterPanel
                  categories={categoriesData}
                  selectedCategory={category}
                  priceRange={priceRange}
                  onCategory={(v) => { setParam('category', v); setDrawerOpen(false) }}
                  onPriceRange={(v) => { setParam('price', v === '0' ? '' : v); setDrawerOpen(false) }}
                  onReset={resetFilters}
                  activeCount={activeFilterCount}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
