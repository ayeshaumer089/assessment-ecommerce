import type { ReactNode } from 'react'

type Variant = 'default' | 'flat' | 'elevated'

interface Props {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: Variant
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const variantClasses: Record<Variant, string> = {
  default:  'bg-white border border-gray-200 shadow-sm',
  flat:     'bg-gray-50 border border-gray-100',
  elevated: 'bg-white shadow-lg shadow-gray-100 border border-gray-100',
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
  onClick,
}: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={[
        'rounded-2xl overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200 text-left w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}
