import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  value: string
}

/** Icon + label + value line used in account detail lists. */
export default function DetailRow({ icon, label, value }: Props) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0">
      <span className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}
