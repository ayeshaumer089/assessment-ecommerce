import { BarChart3, LineChart, PieChart } from 'lucide-react'
import { ROUTES } from '@/constants'
import { AdminPageHeading, ComingSoon } from '@/common/components'
import type { ComingSoonFeature } from '@/common/components'

const PREVIEW: ComingSoonFeature[] = [
  { icon: LineChart, title: 'Revenue trends', desc: 'Daily and monthly sales over time' },
  { icon: PieChart, title: 'Category breakdown', desc: 'Sales distribution by category' },
  { icon: BarChart3, title: 'Conversion metrics', desc: 'Funnel and conversion insights' },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Analytics"
        description="Deep-dive reporting and business insights"
      />

      <ComingSoon
        icon={<BarChart3 size={30} />}
        title="Advanced analytics coming soon"
        description="In the meantime, you can find key sales metrics and recent activity on the dashboard."
        ctaLabel="Go to Dashboard"
        ctaTo={ROUTES.ADMIN.DASHBOARD}
        features={PREVIEW}
      />
    </div>
  )
}
