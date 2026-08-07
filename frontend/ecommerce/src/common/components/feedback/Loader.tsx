type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'spinner' | 'dots' | 'pulse'

interface Props {
  size?: Size
  variant?: Variant
  label?: string
  fullPage?: boolean
  className?: string
}

const spinnerSize: Record<Size, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
  xl: 'w-16 h-16 border-4',
}

const textSize: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

function Spinner({ size = 'md' }: { size?: Size }) {
  return (
    <span
      className={`${spinnerSize[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
    />
  )
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function Pulse() {
  return (
    <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping opacity-75" />
  )
}

export default function Loader({
  size = 'md',
  variant = 'spinner',
  label,
  fullPage = false,
  className = '',
}: Props) {
  const inner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {variant === 'spinner' && <Spinner size={size} />}
      {variant === 'dots' && <Dots />}
      {variant === 'pulse' && <Pulse />}
      {label && <p className={`${textSize[size]} text-gray-500 font-medium`}>{label}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {inner}
      </div>
    )
  }

  return inner
}
