import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description: string
}

/** Muted feature tile used in "coming soon" previews. */
export default function InfoTile({ icon, title, description }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <span className="w-9 h-9 rounded-xl bg-white border border-gray-100 text-indigo-600 flex items-center justify-center mb-3">
        {icon}
      </span>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  )
}
