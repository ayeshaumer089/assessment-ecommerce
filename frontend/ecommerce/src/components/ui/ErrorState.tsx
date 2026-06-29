import type { ReactNode } from 'react'
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'
import Button from './Button'

type ErrorType = 'generic' | 'network' | 'notFound' | 'unauthorized'

interface Props {
  type?: ErrorType
  title?: string
  description?: string
  onRetry?: () => void
  action?: ReactNode
  compact?: boolean
}

const defaults: Record<ErrorType, { title: string; description: string; icon: ReactNode }> = {
  generic: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    icon: <AlertTriangle size={32} />,
  },
  network: {
    title: 'No internet connection',
    description: 'Check your connection and try again.',
    icon: <WifiOff size={32} />,
  },
  notFound: {
    title: 'Not found',
    description: "The resource you're looking for doesn't exist or has been moved.",
    icon: <AlertTriangle size={32} />,
  },
  unauthorized: {
    title: 'Access denied',
    description: "You don't have permission to view this content.",
    icon: <AlertTriangle size={32} />,
  },
}

export default function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
  action,
  compact = false,
}: Props) {
  const config = defaults[type]

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 gap-3' : 'py-20 gap-4'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-2xl bg-red-50 text-red-400 ${
          compact ? 'w-12 h-12' : 'w-20 h-20'
        }`}
      >
        {config.icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-lg'}`}>
          {title ?? config.title}
        </h3>
        <p className={`text-gray-500 max-w-xs mx-auto ${compact ? 'text-xs' : 'text-sm'}`}>
          {description ?? config.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            variant="outline"
            size={compact ? 'sm' : 'md'}
            onClick={onRetry}
            leftIcon={<RefreshCw size={14} />}
          >
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}
