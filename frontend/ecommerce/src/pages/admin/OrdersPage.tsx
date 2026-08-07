import { useState } from 'react'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import { useAllOrders, useUpdateOrderStatus } from '@/hooks'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils'
import { toast } from '@/store'
import {
  AddressLines,
  AdminEmptyState,
  AdminTable,
  AdminTableRow,
  Select,
  TablePanel,
  Tabs,
} from '@/common/components'
import type { AdminTableColumn, TabItem } from '@/common/components'
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

const STATUS_OPTIONS = ALL_STATUSES.map((s) => ({ value: s, label: formatOrderStatus(s) }))

const COLUMNS: AdminTableColumn[] = [
  { label: 'Order ID' },
  { label: 'Date' },
  { label: 'Customer' },
  { label: 'Items' },
  { label: 'Total' },
  { label: 'Status' },
  { label: '', align: 'right' },
]

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
                <AddressLines address={order.shippingAddress} />
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
    <AdminTableRow>
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
        <Select
          value={order.status}
          disabled={isPending}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          className={`sz-status-select ${STATUS_SEL_CLASS[order.status]}`}
          options={STATUS_OPTIONS}
        />
      </td>
      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
        <button className="sz-expand-btn" onClick={onToggle} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </td>
    </AdminTableRow>
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

  const tabs: TabItem<TabFilter>[] = [
    { key: 'all', label: 'All', count: tabCounts.all },
    ...ALL_STATUSES.map((s) => ({
      key: s as TabFilter,
      label: formatOrderStatus(s),
      count: tabCounts[s],
    })),
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

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <TablePanel>
        <AdminTable columns={COLUMNS}>
          {isLoading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 0 }}>
                <AdminEmptyState icon={<Package size={28} />}>
                  No orders found
                </AdminEmptyState>
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
        </AdminTable>
      </TablePanel>
    </div>
  )
}
