import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { ROUTES } from '@/constants/routes'

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN.DASHBOARD]: 'Dashboard',
  [ROUTES.ADMIN.PRODUCTS]: 'Products',
  [ROUTES.ADMIN.ORDERS]: 'Orders',
  [ROUTES.ADMIN.CUSTOMERS]: 'Customers',
  [ROUTES.ADMIN.ANALYTICS]: 'Analytics',
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()

  const title = PAGE_TITLES[pathname] ?? 'Admin'

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
