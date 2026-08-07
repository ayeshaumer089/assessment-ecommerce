import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  /** Largest selectable quantity — usually the remaining stock. */
  max: number
  min?: number
  onChange: (next: number) => void
  iconSize?: number
}

/** Minus / value / plus stepper. */
export default function QuantityControl({
  value,
  max,
  min = 1,
  onChange,
  iconSize = 13,
}: Props) {
  return (
    <div className="sz-qty-control">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} />
      </button>
      <span className="qval">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  )
}
