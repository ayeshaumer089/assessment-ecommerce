import type { ReactNode } from 'react'

interface Props {
  label: string
  optional?: boolean
  error?: string
  /** Spans the full width of the form grid. */
  full?: boolean
  children: ReactNode
}

/** Field wrapper for the checkout wizard's form grid. */
export default function CheckoutField({ label, optional, error, full, children }: Props) {
  return (
    <div className={`sz-field${full ? ' full' : ''}`}>
      <label>
        {label}
        {optional && <span className="opt">Optional</span>}
      </label>
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  )
}
