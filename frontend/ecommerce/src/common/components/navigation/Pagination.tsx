import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  total: number
  limit: number
  onPage: (page: number) => void
}

/** Builds the page list, collapsing long ranges behind ellipses. */
function buildPages(page: number, totalPages: number): (number | '…')[] {
  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }
  pages.push(1)
  if (page > 3) pages.push('…')
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
  if (page < totalPages - 2) pages.push('…')
  pages.push(totalPages)
  return pages
}

/** Numbered pagination with a result-range caption. */
export default function Pagination({ page, totalPages, total, limit, onPage }: Props) {
  if (totalPages <= 1) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  const pages = buildPages(page, totalPages)

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
