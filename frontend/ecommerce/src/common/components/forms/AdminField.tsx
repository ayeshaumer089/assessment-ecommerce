import type { CSSProperties, ReactNode } from 'react'

interface Props {
  label: string
  error?: string
  style?: CSSProperties
  children: ReactNode
}

/** Label / control / error stack used inside admin modals. */
export default function AdminField({ label, error, style, children }: Props) {
  return (
    <div className="adm-field" style={style}>
      <label>{label}</label>
      {children}
      {error && <p className="adm-field-err">{error}</p>}
    </div>
  )
}
