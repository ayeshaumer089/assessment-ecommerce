import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 disabled:bg-indigo-300 disabled:shadow-none',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50',
  outline:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm disabled:opacity-50',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-200 disabled:bg-red-300 disabled:shadow-none',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-200 disabled:bg-emerald-300 disabled:shadow-none',
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
  xl: 'px-6 py-3 text-base gap-2.5 rounded-xl',
}

const spinnerSizes: Record<Size, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-3.5 h-3.5 border',
  md: 'w-4 h-4 border-2',
  lg: 'w-5 h-5 border-2',
  xl: 'w-5 h-5 border-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <span
          className={`${spinnerSizes[size]} border-current border-t-transparent rounded-full animate-spin shrink-0`}
        />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
