import { Link } from 'react-router-dom'
import { BarChart3, LineChart, PieChart, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'

const PREVIEW = [
  { icon: LineChart, title: 'Revenue trends', desc: 'Daily and monthly sales over time' },
  { icon: PieChart, title: 'Category breakdown', desc: 'Sales distribution by category' },
  { icon: BarChart3, title: 'Conversion metrics', desc: 'Funnel and conversion insights' },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Deep-dive reporting and business insights</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
            <BarChart3 size={30} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Advanced analytics coming soon</h2>
          <p className="text-sm text-gray-500 mt-1.5">
            In the meantime, you can find key sales metrics and recent activity on the
            dashboard.
          </p>
          <Link to={ROUTES.ADMIN.DASHBOARD} className="inline-block mt-5">
            <Button rightIcon={<ArrowRight size={16} />}>Go to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100">
          {PREVIEW.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <span className="w-9 h-9 rounded-xl bg-white border border-gray-100 text-indigo-600 flex items-center justify-center mb-3">
                <Icon size={17} />
              </span>
              <p className="text-sm font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
