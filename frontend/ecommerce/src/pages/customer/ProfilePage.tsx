import { Link } from 'react-router-dom'
import {
  Mail, User as UserIcon, ShieldCheck, Calendar, Package,
  ShoppingBag, Wallet, ChevronRight, LogOut, AtSign,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

function StatTile({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function DetailRow({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
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

const QUICK_LINKS = [
  { label: 'My Orders', desc: 'Track and manage your orders', icon: Package, to: ROUTES.CUSTOMER.ORDERS },
  { label: 'Shopping Cart', desc: 'Review items in your cart', icon: ShoppingBag, to: ROUTES.CUSTOMER.CART },
  { label: 'Continue Shopping', desc: 'Browse the latest products', icon: Wallet, to: ROUTES.CUSTOMER.PRODUCTS },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { data: orders = [] } = useOrders()

  const totalOrders = orders.length
  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped',
  ).length
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total ?? 0), 0)

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and view your activity</p>
      </div>

      {/* Identity card */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600" />
        <div className="px-5 sm:px-7 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <span className="w-20 h-20 rounded-2xl bg-indigo-100 border-4 border-white flex items-center justify-center text-indigo-700 font-bold text-3xl shadow-sm shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 truncate">{user?.name}</h2>
                {user?.role === 'admin' && (
                  <Badge label="Admin" variant="primary" size="sm" dot />
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
            {user?.role === 'admin' && (
              <Link to={ROUTES.ADMIN.DASHBOARD} className="shrink-0">
                <Button variant="outline" size="sm" leftIcon={<ShieldCheck size={15} />}>
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile icon={<Package size={17} />} label="Total Orders" value={String(totalOrders)} />
        <StatTile icon={<ShoppingBag size={17} />} label="Active Orders" value={String(activeOrders)} />
        <StatTile icon={<Wallet size={17} />} label="Total Spent" value={formatCurrency(totalSpent)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Account Details</h3>
          <div>
            <DetailRow icon={<UserIcon size={16} />} label="Full name" value={user?.name ?? '—'} />
            <DetailRow icon={<Mail size={16} />} label="Email address" value={user?.email ?? '—'} />
            {user?.username && (
              <DetailRow icon={<AtSign size={16} />} label="Username" value={user.username} />
            )}
            <DetailRow
              icon={<ShieldCheck size={16} />}
              label="Account type"
              value={user?.role === 'admin' ? 'Administrator' : 'Customer'}
            />
            {user?.createdAt && (
              <DetailRow
                icon={<Calendar size={16} />}
                label="Member since"
                value={formatDate(user.createdAt)}
              />
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Quick Actions</h3>
          <div className="flex-1">
            {QUICK_LINKS.map(({ label, desc, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 -mx-1 px-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            ))}
          </div>

          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
