import { Star } from 'lucide-react'
import type { CSSProperties } from 'react'

const FILLED = '#FBBF24'
const PARTIAL = '#FDE68A'
const EMPTY = '#D8D3E6'

interface Props {
  rating: number
  size?: number
  /**
   * When true a star whose index falls inside the fractional part of the
   * rating is tinted rather than left empty.
   */
  precise?: boolean
  className?: string
  style?: CSSProperties
}

function starStyle(index: number, rating: number, precise: boolean): CSSProperties {
  if (!precise) {
    const on = index < rating
    return { fill: on ? FILLED : EMPTY, color: on ? FILLED : EMPTY }
  }
  return {
    fill: index < Math.floor(rating) ? FILLED : index < rating ? PARTIAL : EMPTY,
    color: index < Math.floor(rating) ? FILLED : index < rating ? FILLED : EMPTY,
  }
}

/** A bare row of five inline-styled stars. */
export default function StarRow({
  rating,
  size = 14,
  precise = false,
  className,
  style,
}: Props) {
  return (
    <span className={className} style={{ display: 'flex', gap: 2, ...style }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} style={starStyle(i, rating, precise)} />
      ))}
    </span>
  )
}
