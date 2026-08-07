import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description: ReactNode
  /** Heading element for the title — matches the surrounding document outline. */
  as?: 'h2' | 'h3'
  action?: ReactNode
}

/** Centred empty state used across the customer storefront. */
export default function SzEmptyState({
  icon,
  title,
  description,
  as: Heading = 'h2',
  action,
}: Props) {
  return (
    <div className="sz-empty">
      <div className="icon-wrap">{icon}</div>
      <Heading>{title}</Heading>
      <p>{description}</p>
      {action}
    </div>
  )
}
