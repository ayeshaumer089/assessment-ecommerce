import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'

interface Props {
  collapsed: boolean
  onToggle: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard, end: true },
  { label: 'Products', to: ROUTES.ADMIN.PRODUCTS, icon: Package },
  { label: 'Orders', to: ROUTES.ADMIN.ORDERS, icon: ShoppingBag },
  { label: 'Customers', to: ROUTES.ADMIN.CUSTOMERS, icon: Users },
  { label: 'Analytics', to: ROUTES.ADMIN.ANALYTICS, icon: BarChart3 },
]

export default function AdminSidebar({ collapsed, onToggle }: Props) {
  return (
    <aside
      className={`relative flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-gray-800 shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </span>
        {!collapsed && (
          <span className="ml-2.5 font-bold text-white text-base tracking-tight whitespace-nowrap overflow-hidden">
            {ENV.APP_NAME}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 my-0.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shadow-md"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
