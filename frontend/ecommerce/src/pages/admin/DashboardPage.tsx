import { useMemo } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, CartesianGrid, XAxis, YAxis,
} from 'recharts'
import { TrendingUp, ShoppingBag, Package, BarChart3 } from 'lucide-react'
import { useAllOrders } from '@/hooks/useOrders'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils/formatters'
import Badge from '@/components/ui/Badge'
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

function SkeletonCard() {
  return (
    <div className="sz-stat-card" style={{ animation: 'fade-in .3s ease' }}>
      <div className="sz-stat-top">
        <div style={{ height: 14, width: 100, background: '#ECE8F6', borderRadius: 6 }} />
        <div style={{ width: 38, height: 38, borderRadius: 11, background: '#ECE8F6' }} />
      </div>
      <div style={{ height: 28, width: 120, background: '#ECE8F6', borderRadius: 8 }} />
    </div>
  )
}

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
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 26, color: 'var(--ink)' }}>Dashboard</h1>
        <div className="sz-stat-grid">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="sz-chart-row">
          {[1, 2].map((i) => (
            <div key={i} className="sz-panel" style={{ animation: 'fade-in .3s ease' }}>
              <div style={{ height: 16, width: 160, background: '#ECE8F6', borderRadius: 6, marginBottom: 18 }} />
              <div style={{ height: 260, background: '#F8F7FB', borderRadius: 14 }} />
            </div>
          ))}
        </div>
        <div className="sz-table-panel">
          <div className="sz-table-panel-head">Recent Orders</div>
          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ height: 40, background: '#F8F7FB', borderRadius: 8 }} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sz-admin">
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 26, color: 'var(--ink)' }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="sz-stat-grid">
        <div className="sz-stat-card">
          <div className="sz-stat-top">
            <span className="sz-stat-label">Total Sales</span>
            <span className="sz-stat-ic ic-violet"><TrendingUp size={18} /></span>
          </div>
          <div className="sz-stat-val">{formatCurrency(stats.totalSales)}</div>
        </div>
        <div className="sz-stat-card">
          <div className="sz-stat-top">
            <span className="sz-stat-label">Total Orders</span>
            <span className="sz-stat-ic ic-mint"><ShoppingBag size={18} /></span>
          </div>
          <div className="sz-stat-val">{stats.totalOrders}</div>
        </div>
        <div className="sz-stat-card">
          <div className="sz-stat-top">
            <span className="sz-stat-label">Active Orders</span>
            <span className="sz-stat-ic ic-blue"><Package size={18} /></span>
          </div>
          <div className="sz-stat-val">{stats.activeOrders}</div>
        </div>
        <div className="sz-stat-card">
          <div className="sz-stat-top">
            <span className="sz-stat-label">Avg Order Value</span>
            <span className="sz-stat-ic ic-gold"><BarChart3 size={18} /></span>
          </div>
          <div className="sz-stat-val">{formatCurrency(stats.avgOrderValue)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="sz-chart-row">
        <div className="sz-panel">
          <h3>Order Status Distribution</h3>
          {orders.length === 0 ? (
            <div style={{ height: 260, border: '1.5px dashed var(--line)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#B4AECB', fontSize: 13.5, fontWeight: 500, background: '#FBFAFD' }}>
              <span style={{ fontSize: 26 }}>◔</span> No order data yet
            </div>
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
        </div>

        <div className="sz-panel">
          <h3>Top 5 Products by Revenue</h3>
          {topProductsData.length === 0 ? (
            <div style={{ height: 260, border: '1.5px dashed var(--line)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#B4AECB', fontSize: 13.5, fontWeight: 500, background: '#FBFAFD' }}>
              <span style={{ fontSize: 26 }}>▤</span> No revenue data yet
            </div>
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
        </div>
      </div>

      {/* Recent orders table */}
      <div className="sz-table-panel">
        <div className="sz-table-panel-head">Recent Orders</div>
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
      </div>
    </div>
  )
}
