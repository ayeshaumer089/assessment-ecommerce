import { useState } from 'react'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils/formatters'
import { toast } from '@/store/toastStore'
import Badge from '@/components/ui/Badge'
import type { Order, OrderStatus } from '@/types'

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

type TabFilter = 'all' | OrderStatus

const STATUS_SEL_CLASS: Record<OrderStatus, string> = {
  pending:    'sz-sel-pending',
  processing: 'sz-sel-processing',
  shipped:    'sz-sel-shipped',
  delivered:  'sz-sel-delivered',
  cancelled:  'sz-sel-cancelled',
}

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'warning' | 'info' | 'purple' | 'success' | 'default'> = {
  pending:    'warning',
  processing: 'info',
  shipped:    'purple',
  delivered:  'success',
  cancelled:  'default',
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} style={{ padding: '14px 18px' }}>
              <div style={{ height: 14, background: '#ECE8F6', borderRadius: 6 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function ExpandedRow({ order }: { order: Order }) {
  return (
    <tr className="sz-expanded-row">
      <td colSpan={7}>
        <div className="sz-exp-grid">
          <div>
            <div className="sz-exp-label">Items</div>
            <div className="sz-exp-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="exp-item">
                  <div className="exp-thumb">
                    <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                      {item.quantity} × {formatCurrency(item.product.discountedPrice)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, flexShrink: 0 }}>
                    {formatCurrency(item.product.discountedPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="sz-exp-label">Shipping Address</div>
              <div className="sz-exp-val">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
            <div>
              <div className="sz-exp-label">Payment Method</div>
              <div className="sz-exp-val">{order.paymentMethod}</div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

function OrderRow({
  order,
  isExpanded,
  onToggle,
  isPending,
  onStatusChange,
}: {
  order: Order
  isExpanded: boolean
  onToggle: () => void
  isPending: boolean
  onStatusChange: (status: OrderStatus) => void
}) {
  return (
    <tr style={{ borderBottom: '1px solid var(--line)', transition: 'background .15s ease', cursor: 'default' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9FE')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: 12, color: 'var(--ink-soft)' }}>
        {order.id.length > 20 ? order.id.slice(0, 20) + '…' : order.id}
      </td>
      <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
        {formatDate(order.createdAt)}
      </td>
      <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink)' }}>
        Customer #{order.userId}
      </td>
      <td style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
        {order.items.length}
      </td>
      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        {formatCurrency(order.total)}
      </td>
      <td style={{ padding: '14px 18px' }}>
        <select
          value={order.status}
          disabled={isPending}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          className={`sz-status-select ${STATUS_SEL_CLASS[order.status]}`}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{formatOrderStatus(s)}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
        <button className="sz-expand-btn" onClick={onToggle} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </td>
    </tr>
  )
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAllOrders()
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const [activeTab,  setActiveTab]  = useState<TabFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const tabCounts = {
    all: orders.length,
    ...Object.fromEntries(ALL_STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])),
  } as Record<TabFilter, number>

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab)

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    ...ALL_STATUSES.map((s) => ({ key: s as TabFilter, label: formatOrderStatus(s) })),
  ]

  function handleStatusChange(order: Order, status: OrderStatus) {
    if (status === order.status) return
    updateStatus(
      { id: order.id, status },
      {
        onSuccess: () => toast.success(`Order updated to ${formatOrderStatus(status)}`),
        onError:   () => toast.error('Failed to update order status'),
      },
    )
  }

  return (
    <div className="sz-admin">
      <div className="sz-head-with-badge">
        <h1>Orders</h1>
        <span className="sz-total-badge">{orders.length}</span>
      </div>

      <div className="sz-tabs">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`sz-tab${activeTab === key ? ' active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
            <span className="count">{tabCounts[key]}</span>
          </button>
        ))}
      </div>

      <div className="sz-table-panel">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: i === 6 ? 'right' : 'left',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#9A93AE', padding: '14px 18px', borderBottom: '1px solid var(--line)',
                    background: '#FBFAFD', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <div className="sz-empty-state">
                      <div className="sz-empty-ic"><Package size={28} /></div>
                      <div className="sz-empty-text">No orders found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <>
                    <OrderRow
                      key={order.id}
                      order={order}
                      isExpanded={expandedId === order.id}
                      onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      isPending={isPending}
                      onStatusChange={(status) => handleStatusChange(order, status)}
                    />
                    {expandedId === order.id && (
                      <ExpandedRow key={`${order.id}-exp`} order={order} />
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
