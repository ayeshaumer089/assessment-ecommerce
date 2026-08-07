import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onPage: (page: number) => void
}

/** Prev / next pager used beneath admin tables. */
export default function AdminPagination({ page, totalPages, onPage }: Props) {
  return (
    <div className="sz-pagination">
      <span className="pg-info">Page {page} of {totalPages}</span>
      <div className="pg-btns">
        <button className="sz-btn-pg" onClick={() => onPage(page - 1)} disabled={page <= 1}>
          <ChevronLeft size={14} /> Previous
        </button>
        <button className="sz-btn-pg" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
