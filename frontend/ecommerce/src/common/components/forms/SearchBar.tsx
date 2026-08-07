import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'search'
  iconSize?: number
  iconClassName?: string
  /** When supplied, a clear button appears while the field has a value. */
  onClear?: () => void
}

/** Pill-shaped search field. */
export default function SearchBar({
  value,
  onChange,
  placeholder,
  type = 'text',
  iconSize = 15,
  iconClassName,
  onClear,
}: Props) {
  return (
    <div className="sz-search-bar">
      <Search size={iconSize} className={iconClassName} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {onClear && value && (
        <button className="clr" onClick={onClear} aria-label="Clear search">
          <X size={15} />
        </button>
      )}
    </div>
  )
}
