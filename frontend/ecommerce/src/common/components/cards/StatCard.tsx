import type { ReactNode } from 'react'

export type StatTone = 'violet' | 'mint' | 'blue' | 'gold'

interface Props {
  label: string
  value: ReactNode
  icon: ReactNode
  tone: StatTone
}

/** Headline metric tile on the admin dashboard. */
export default function StatCard({ label, value, icon, tone }: Props) {
  return (
    <div className="sz-stat-card">
      <div className="sz-stat-top">
        <span className="sz-stat-label">{label}</span>
        <span className={`sz-stat-ic ic-${tone}`}>{icon}</span>
      </div>
      <div className="sz-stat-val">{value}</div>
    </div>
  )
}
