import { Users, UserPlus, ShoppingBag } from 'lucide-react'
import { ROUTES } from '@/constants'
import { AdminPageHeading, ComingSoon } from '@/common/components'
import type { ComingSoonFeature } from '@/common/components'

const PREVIEW: ComingSoonFeature[] = [
  { icon: Users, title: 'Customer directory', desc: 'Browse and search all customers' },
  { icon: UserPlus, title: 'Segments', desc: 'Group customers by activity' },
  { icon: ShoppingBag, title: 'Purchase history', desc: 'View per-customer orders' },
]

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Customers"
        description="Manage your customer base and relationships"
      />

      <ComingSoon
        icon={<Users size={30} />}
        title="Customer management coming soon"
        description="A full customer directory is on the way. For now, you can review customer orders from the orders page."
        ctaLabel="View Orders"
        ctaTo={ROUTES.ADMIN.ORDERS}
        features={PREVIEW}
      />
    </div>
  )
}
