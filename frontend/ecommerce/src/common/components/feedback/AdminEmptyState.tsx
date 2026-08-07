import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  children: ReactNode
}

/** Empty state used inside admin table panels. */
export default function AdminEmptyState({ icon, children }: Props) {
  return (
    <div className="sz-empty-state">
      <div className="sz-empty-ic">{icon}</div>
      <div className="sz-empty-text">{children}</div>
    </div>
  )
}
