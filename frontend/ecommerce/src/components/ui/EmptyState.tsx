import type { ReactNode } from 'react'
import { PackageSearch } from 'lucide-react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

export default function EmptyState({ icon, title, description, action, compact = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 gap-3' : 'py-20 gap-4'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 ${
          compact ? 'w-12 h-12' : 'w-20 h-20'
        }`}
      >
        {icon ?? <PackageSearch size={compact ? 22 : 36} />}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-lg'}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-gray-500 max-w-xs mx-auto ${compact ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
