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
  mobileOpen: boolean
  onMobileClose: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard, end: true },
  { label: 'Products', to: ROUTES.ADMIN.PRODUCTS, icon: Package },
  { label: 'Orders', to: ROUTES.ADMIN.ORDERS, icon: ShoppingBag },
  { label: 'Customers', to: ROUTES.ADMIN.CUSTOMERS, icon: Users },
  { label: 'Analytics', to: ROUTES.ADMIN.ANALYTICS, icon: BarChart3 },
]

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full z-50 flex flex-col bg-gray-900 text-white',
          'transition-all duration-300 ease-in-out shrink-0',
          // Mobile: slide in/out
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, respect collapsed state
          'md:relative md:h-auto md:translate-x-0',
          collapsed ? 'md:w-16' : 'md:w-60',
          'w-60',
        ].join(' ')}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center border-b border-gray-800 shrink-0 ${
            collapsed ? 'md:justify-center md:px-0 px-5' : 'px-5'
          }`}
        >
          <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </span>
          <span
            className={[
              'ml-2.5 font-bold text-white text-base tracking-tight whitespace-nowrap overflow-hidden',
              collapsed ? 'md:hidden' : '',
            ].join(' ')}
          >
            {ENV.APP_NAME}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-150 my-0.5',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                  collapsed ? 'md:justify-center' : '',
                ].join(' ')
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-20 z-10 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shadow-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  )
}
