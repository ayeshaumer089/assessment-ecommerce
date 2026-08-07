import type { ReactNode } from 'react'

interface Props {
  /** Optional caption bar rendered above the table. */
  heading?: ReactNode
  children: ReactNode
}

/** Rounded surface that hosts an admin table. */
export default function TablePanel({ heading, children }: Props) {
  return (
    <div className="sz-table-panel">
      {heading && <div className="sz-table-panel-head">{heading}</div>}
      {children}
    </div>
  )
}
