import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, ShoppingBag, Package, BarChart3 } from 'lucide-react'
import { useAllOrders } from '@/hooks/useOrders'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils/formatters'
import Badge from '@/components/ui/Badge'
import type { OrderStatus } from '@/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#6b7280',
}

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'warning' | 'info' | 'purple' | 'success' | 'default'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'purple',
  delivered: 'success',
  cancelled: 'default',
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-7 w-32 bg-gray-200 rounded" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-60 bg-gray-100 rounded-xl" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: orders = [], isLoading } = useAllOrders()

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = orders.length
    const activeOrders = orders.filter(
      (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
    ).length
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
    return { totalSales, totalOrders, activeOrders, avgOrderValue }
  }, [orders])

  const statusChartData = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const order of orders) {
      counts[order.status] = (counts[order.status] ?? 0) + 1
    }
    return (Object.keys(counts) as OrderStatus[]).map((status) => ({
      name: formatOrderStatus(status),
      value: counts[status],
      color: STATUS_COLORS[status],
    }))
  }, [orders])

  const topProductsData = useMemo(() => {
    const revenueMap = new Map<string, number>()
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.product.name
        const revenue = item.product.discountedPrice * item.quantity
        revenueMap.set(key, (revenueMap.get(key) ?? 0) + revenue)
      }
    }
    return Array.from(revenueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({
        name: name.length > 18 ? name.slice(0, 18) + '…' : name,
        revenue,
      }))
  }, [orders])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Active Orders</p>
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <BarChart3 size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="value"
                innerRadius={50}
                outerRadius={90}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [Number(value), 'Orders']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart layout="vertical" data={topProductsData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 font-medium text-gray-500">Order ID</th>
                <th className="text-left pb-2 font-medium text-gray-500">Date</th>
                <th className="text-left pb-2 font-medium text-gray-500">Status</th>
                <th className="text-right pb-2 font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className="font-mono text-xs text-gray-600">
                      {order.id.length > 20 ? order.id.slice(0, 20) + '…' : order.id}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="py-2.5 pr-4">
                    <Badge
                      label={formatOrderStatus(order.status)}
                      variant={STATUS_BADGE_VARIANT[order.status]}
                      size="sm"
                      dot
                    />
                  </td>
                  <td className="py-2.5 text-right font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
