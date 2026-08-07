import { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts'
import { TrendingUp, ShoppingBag, Package, BarChart3 } from 'lucide-react'
import { useAllOrders } from '@/hooks'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils'
import {
  AdminPanel,
  Badge,
  ChartPlaceholder,
  StatCard,
  StatCardSkeleton,
  TablePanel,
} from '@/common/components'
import type { OrderStatus } from '@/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    '#E8A93B',
  processing: '#2E84E0',
  shipped:    '#5B3DF6',
  delivered:  '#1FAE7E',
  cancelled:  '#9C96AE',
}

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'warning' | 'info' | 'purple' | 'success' | 'default'> = {
  pending:    'warning',
  processing: 'info',
  shipped:    'purple',
  delivered:  'success',
  cancelled:  'default',
}

const HEADING_STYLE = {
  fontFamily: "'Fraunces', serif",
  fontSize: 30,
  fontWeight: 600,
  letterSpacing: '-0.01em',
  marginBottom: 26,
  color: 'var(--ink)',
} as const

export default function DashboardPage() {
  const { data: orders = [], isLoading } = useAllOrders()

  const stats = useMemo(() => {
    const totalSales    = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders   = orders.length
    const activeOrders  = orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status)).length
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
    return { totalSales, totalOrders, activeOrders, avgOrderValue }
  }, [orders])

  const statusChartData = useMemo(() => {
    const counts: Record<OrderStatus, number> = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
    for (const order of orders) counts[order.status] = (counts[order.status] ?? 0) + 1
    return (Object.keys(counts) as OrderStatus[]).map((status) => ({
      name: formatOrderStatus(status), value: counts[status], color: STATUS_COLORS[status],
    }))
  }, [orders])

  const topProductsData = useMemo(() => {
    const revenueMap = new Map<string, number>()
    for (const order of orders)
      for (const item of order.items) {
        const key = item.product.name
        revenueMap.set(key, (revenueMap.get(key) ?? 0) + item.product.discountedPrice * item.quantity)
      }
    return Array.from(revenueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, revenue }))
  }, [orders])

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders],
  )

  if (isLoading) {
    return (
      <div className="sz-admin">
        <h1 style={HEADING_STYLE}>Dashboard</h1>
        <div className="sz-stat-grid">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="sz-chart-row">
          {[1, 2].map((i) => (
            <AdminPanel key={i} style={{ animation: 'fade-in .3s ease' }}>
              <div style={{ height: 16, width: 160, background: '#ECE8F6', borderRadius: 6, marginBottom: 18 }} />
              <div style={{ height: 260, background: '#F8F7FB', borderRadius: 14 }} />
            </AdminPanel>
          ))}
        </div>
        <TablePanel heading="Recent Orders">
          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ height: 40, background: '#F8F7FB', borderRadius: 8 }} />)}
          </div>
        </TablePanel>
      </div>
    )
  }

  return (
    <div className="sz-admin">
      <h1 style={HEADING_STYLE}>Dashboard</h1>

      {/* Stat cards */}
      <div className="sz-stat-grid">
        <StatCard
          label="Total Sales"
          value={formatCurrency(stats.totalSales)}
          icon={<TrendingUp size={18} />}
          tone="violet"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag size={18} />}
          tone="mint"
        />
        <StatCard
          label="Active Orders"
          value={stats.activeOrders}
          icon={<Package size={18} />}
          tone="blue"
        />
        <StatCard
          label="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          icon={<BarChart3 size={18} />}
          tone="gold"
        />
      </div>

      {/* Charts */}
      <div className="sz-chart-row">
        <AdminPanel title="Order Status Distribution">
          {orders.length === 0 ? (
            <ChartPlaceholder glyph="◔" message="No order data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusChartData} dataKey="value" innerRadius={50} outerRadius={90}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value), 'Orders']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="sz-legend">
            {[
              { label: 'Cancelled',  color: '#9C96AE' },
              { label: 'Delivered',  color: '#1FAE7E' },
              { label: 'Pending',    color: '#E8A93B' },
              { label: 'Processing', color: '#2E84E0' },
              { label: 'Shipped',    color: '#5B3DF6' },
            ].map(({ label, color }) => (
              <span key={label}>
                <span className="sz-ldot" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Top 5 Products by Revenue">
          {topProductsData.length === 0 ? (
            <ChartPlaceholder glyph="▤" message="No revenue data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={topProductsData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                <Bar dataKey="revenue" fill="#5B3DF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminPanel>
      </div>

      {/* Recent orders table */}
      <TablePanel heading="Recent Orders">
        <table className="sz-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px', color: '#B4AECB' }}>
                  No orders yet
                </td>
              </tr>
            ) : recentOrders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--ink-soft)' }}>
                  {order.id.length > 20 ? order.id.slice(0, 20) + '…' : order.id}
                </td>
                <td style={{ color: 'var(--ink-soft)' }}>{formatDate(order.createdAt)}</td>
                <td>
                  <Badge
                    label={formatOrderStatus(order.status)}
                    variant={STATUS_BADGE_VARIANT[order.status]}
                    size="sm"
                    dot
                  />
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablePanel>
    </div>
  )
}
