import { useState } from 'react'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils/formatters'
import { toast } from '@/store/toastStore'
import Badge from '@/components/ui/Badge'
import type { Order, OrderStatus } from '@/types'

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_SELECT_BG: Record<OrderStatus, string> = {
  pending: 'bg-amber-50',
  processing: 'bg-blue-50',
  shipped: 'bg-indigo-50',
  delivered: 'bg-emerald-50',
  cancelled: 'bg-gray-100',
}

type TabFilter = 'all' | OrderStatus

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-7 w-28 bg-gray-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-7 w-7 bg-gray-200 rounded" /></td>
        </tr>
      ))}
    </>
  )
}

interface ExpandedRowProps {
  order: Order
}

function ExpandedRow({ order }: ExpandedRowProps) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={7} className="px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</p>
            <ul className="space-y-2">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {formatCurrency(item.product.discountedPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 shrink-0">
                    {formatCurrency(item.product.discountedPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Address</p>
              <address className="not-italic text-sm text-gray-700 leading-relaxed">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </address>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Method</p>
              <p className="text-sm text-gray-700">{order.paymentMethod}</p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

interface OrderRowProps {
  order: Order
  isExpanded: boolean
  onToggle: () => void
  isPending: boolean
  onStatusChange: (status: OrderStatus) => void
}

function OrderRow({ order, isExpanded, onToggle, isPending, onStatusChange }: OrderRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-gray-600">
          {order.id.length > 20 ? order.id.slice(0, 20) + '…' : order.id}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(order.createdAt)}</td>
      <td className="px-4 py-3 text-sm text-gray-700">Customer #{order.userId}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{order.items.length}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
        {formatCurrency(order.total)}
      </td>
      <td className="px-4 py-3">
        <select
          value={order.status}
          disabled={isPending}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          className={[
            'text-xs font-medium rounded-lg border border-gray-200 px-2 py-1.5 outline-none',
            'focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
            'disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer',
            STATUS_SELECT_BG[order.status],
          ].join(' ')}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {formatOrderStatus(s)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </td>
    </tr>
  )
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAllOrders()
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const tabCounts = {
    all: orders.length,
    ...Object.fromEntries(
      ALL_STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])
    ),
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
        onSuccess: () => toast.success(`Order status updated to ${formatOrderStatus(status)}`),
        onError: () => toast.error('Failed to update order status'),
      },
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Badge label={String(orders.length)} variant="primary" />
      </div>

      <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {label}
            <span
              className={[
                'ml-1.5 inline-flex items-center justify-center text-[11px] font-semibold rounded-full px-1.5 py-0.5',
                activeTab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500',
              ].join(' ')}
            >
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Package size={36} strokeWidth={1.5} />
                      <p className="text-sm font-medium">No orders found</p>
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
                      <ExpandedRow key={`${order.id}-expanded`} order={order} />
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
