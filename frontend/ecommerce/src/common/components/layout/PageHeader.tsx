import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: ReactNode
}

/** Storefront page title with a supporting line beneath it. */
export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className="sz-page-head">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}
