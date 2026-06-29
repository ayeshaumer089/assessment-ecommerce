type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
type Size = 'sm' | 'md'

interface Props {
  label: string
  variant?: Variant
  size?: Size
  dot?: boolean
}

const variantClasses: Record<Variant, string> = {
  default:  'bg-gray-100 text-gray-600 border border-gray-200',
  primary:  'bg-indigo-50 text-indigo-700 border border-indigo-200',
  success:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning:  'bg-amber-50 text-amber-700 border border-amber-200',
  danger:   'bg-red-50 text-red-700 border border-red-200',
  info:     'bg-blue-50 text-blue-700 border border-blue-200',
  purple:   'bg-purple-50 text-purple-700 border border-purple-200',
}

const dotColors: Record<Variant, string> = {
  default:  'bg-gray-400',
  primary:  'bg-indigo-500',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  info:     'bg-blue-500',
  purple:   'bg-purple-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

export default function Badge({ label, variant = 'default', size = 'md', dot = false }: Props) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {label}
    </span>
  )
}
