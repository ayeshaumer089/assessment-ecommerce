import type { CSSProperties, ReactNode } from 'react'

interface Props {
  label: ReactNode
  value: ReactNode
  /** Class applied to the value span — `v`, `savings`, `free`, … */
  valueClassName?: string
  /** Applied to the label span, e.g. to lay an icon out beside the text. */
  labelStyle?: CSSProperties
}

/** One label/value line inside an order-summary panel. */
export default function SummaryRow({ label, value, valueClassName, labelStyle }: Props) {
  return (
    <div className="sz-sum-row">
      <span style={labelStyle}>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}
