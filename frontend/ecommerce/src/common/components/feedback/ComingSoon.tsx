import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../buttons/Button'
import InfoTile from '../cards/InfoTile'

export interface ComingSoonFeature {
  icon: ComponentType<{ size?: number }>
  title: string
  desc: string
}

interface Props {
  icon: ReactNode
  title: string
  description: ReactNode
  ctaLabel: string
  ctaTo: string
  features: ComingSoonFeature[]
}

/** Placeholder panel for admin sections that are not built out yet. */
export default function ComingSoon({
  icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  features,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1.5">{description}</p>
        <Link to={ctaTo} className="inline-block mt-5">
          <Button rightIcon={<ArrowRight size={16} />}>{ctaLabel}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100">
        {features.map(({ icon: Icon, title: featureTitle, desc }) => (
          <InfoTile
            key={featureTitle}
            icon={<Icon size={17} />}
            title={featureTitle}
            description={desc}
          />
        ))}
      </div>
    </div>
  )
}
