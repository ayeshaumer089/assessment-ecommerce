import type { CSSProperties, ReactNode } from 'react'

interface Props {
  title?: string
  style?: CSSProperties
  children: ReactNode
}

/** Card surface used for dashboard charts. */
export default function AdminPanel({ title, style, children }: Props) {
  return (
    <div className="sz-panel" style={style}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}
