import type { ReactNode } from 'react'

interface Props {
  label?: ReactNode
  value: ReactNode
  /** Optional caption rendered directly beneath the row. */
  note?: ReactNode
}

/** Emphasised grand-total line of an order-summary panel. */
export default function TotalRow({ label = 'Total', value, note }: Props) {
  return (
    <>
      <div className="sz-total-row">
        <span className="lbl">{label}</span>
        <span className="amt">{value}</span>
      </div>
      {note && <div className="sz-tax-note">{note}</div>}
    </>
  )
}
