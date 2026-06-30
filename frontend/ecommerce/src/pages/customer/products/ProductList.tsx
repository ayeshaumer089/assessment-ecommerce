import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, LayoutGrid,
} from 'lucide-react'
import { useProducts, useSearchProducts, useCategories } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useDebounce } from '@/hooks/useDebounce'
import ProductCard from '@/components/common/ProductCard'
import ProductCardSkeleton from '@/components/common/ProductCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
          {activeCount > 0 && (
            <span className="text-[11px] font-bold text-white bg-indigo-600 rounded-full px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategory('')}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                selectedCategory === ''
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => onCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm capitalize transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Price range
        </p>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range, i) => {
            const key = String(i)
            return (
              <li key={key}>
                <button
                  onClick={() => onPriceRange(key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    priceRange === key
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-800">{start}–{end}</span> of{' '}
        <span className="font-semibold text-gray-800">{total}</span> products
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

  // Build API params
  const apiFilters: ProductFilters = {
    page,
    limit: PAGE_SIZE,
    category: category || undefined,
    ...toApiSort(sort),
  }

  // Data fetching — switch between browse and search mode
  const browseQuery     = useProducts(apiFilters)
  const searchQuery     = useSearchProducts(debouncedSearch)
  const categoriesQuery = useCategories()

  const categoriesData = categoriesQuery.data ?? []
  const catsLoading    = categoriesQuery.isLoading

  const activeQuery = isSearching ? searchQuery : browseQuery
  const { data, isLoading, isError, refetch } = activeQuery

  // Apply client-side price + newest sort
  const filteredItems = useMemo(
    () => applyClientFilters(data?.items ?? [], priceMin, priceMax),
    [data?.items, priceMin, priceMax],
  )

  const totalPages = isSearching
    ? Math.ceil(filteredItems.length / PAGE_SIZE)
    : data?.totalPages ?? 1
  const displayedItems = isSearching
    ? filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filteredItems

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
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? 'Loading…' : `${data?.total ?? filteredItems.length} items available`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* ── Desktop filter sidebar ────────────────────────────────── */}
        <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search bar */}
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="search"
                value={rawSearch}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="Search products…"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {rawSearch && (
                <button
                  onClick={() => setParam('q', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-700 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-indigo-600 rounded-full flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {(category || priceRange !== '0') && (
            <div className="flex flex-wrap gap-2 mb-5">
              {category && (
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium rounded-full">
                  {category}
                  <button
                    onClick={() => setParam('category', '')}
                    className="hover:bg-indigo-100 rounded-full p-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {priceRange !== '0' && (
                <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium rounded-full">
                  {PRICE_RANGES[Number(priceRange)]?.label}
                  <button
                    onClick={() => setParam('price', '')}
                    className="hover:bg-indigo-100 rounded-full p-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Search mode banner */}
          {isSearching && (
            <div className="mb-5 flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                Results for <span className="font-semibold">"{debouncedSearch}"</span>
                {filteredItems.length > 0 && ` — ${filteredItems.length} found`}
              </p>
              <button
                onClick={() => setParam('q', '')}
                className="text-sm text-blue-700 font-semibold hover:underline shrink-0"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Grid */}
          {isError ? (
            <ErrorState type="network" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
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
                  className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-xl hover:bg-indigo-50"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {displayedItems.map((product) => (
                <ProductCard
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
              total={isSearching ? filteredItems.length : (data?.total ?? 0)}
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
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 shrink-0">
              <h3 className="font-semibold text-gray-900">Filters</h3>
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
