import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Clock, Truck, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, ShoppingBag, MapPin, CreditCard,
} from 'lucide-react'
import { useOrders, useCancelOrder } from '@/hooks/useOrders'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Order, OrderStatus } from '@/types'

type Filter = 'all' | 'active' | 'delivered' | 'cancelled'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    badgeVariant: 'warning' | 'info' | 'primary' | 'success' | 'default'
    label: string
    iconBg: string
    iconColor: string
    Icon: React.FC<{ size?: number }>
  }
> = {
  pending: {
    badgeVariant: 'warning',
    label: 'Pending',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    Icon: Clock,
  },
  processing: {
    badgeVariant: 'info',
    label: 'Processing',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    Icon: Package,
  },
  shipped: {
    badgeVariant: 'primary',
    label: 'Shipped',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    Icon: Truck,
  },
  delivered: {
    badgeVariant: 'success',
    label: 'Delivered',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  cancelled: {
    badgeVariant: 'default',
    label: 'Cancelled',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-400',
    Icon: XCircle,
  },
}

function matchesFilter(order: Order, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'active') return ['pending', 'processing', 'shipped'].includes(order.status)
  return order.status === filter
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()

  const cfg        = STATUS_CONFIG[order.status]
  const canCancel  = order.status === 'pending' || order.status === 'processing'
  const itemCount  = order.items.reduce((s, i) => s + i.quantity, 0)
  const preview    = order.items.slice(0, 3)
  const extraCount = order.items.length - 3

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
            <cfg.Icon size={17} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Order ID</p>
            <p className="font-mono text-sm font-bold text-gray-900 leading-none">{order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge label={cfg.label} variant={cfg.badgeVariant} dot />
          <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Product preview + total */}
        <div className="flex items-center gap-2.5 mb-4">
          {preview.map(({ product }) => (
            <div
              key={product.id}
              className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0"
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
              +{extraCount}
            </div>
          )}
          <div className="flex-1 text-right ml-auto">
            <p className="text-xs text-gray-400 mb-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-gray-100 pt-4 space-y-5 mb-4">
            {/* Full item list */}
            <div className="space-y-3">
              {order.items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      Qty {quantity} × {formatCurrency(product.discountedPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {formatCurrency(product.discountedPrice * quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.discountedTotal)}</span>
              </div>
              {order.subtotal - order.discountedTotal > 0.01 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Savings</span>
                  <span className="font-semibold">-{formatCurrency(order.subtotal - order.discountedTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={order.total - order.discountedTotal <= 0.01 ? 'text-emerald-600' : ''}>
                  {order.total - order.discountedTotal <= 0.01 ? 'Free' : formatCurrency(order.total - order.discountedTotal)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Shipping + Payment */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                  <MapPin size={11} className="text-indigo-400" /> SHIPPED TO
                </p>
                <p className="text-sm text-gray-700">{order.shippingAddress.street}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                  <CreditCard size={11} className="text-indigo-400" /> PAYMENT
                </p>
                <p className="text-sm text-gray-700">{order.paymentMethod}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            {expanded
              ? <><ChevronUp size={15} /> Hide Details</>
              : <><ChevronDown size={15} /> View Details</>
            }
          </button>

          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              loading={isCancelling}
              onClick={() => cancelOrder(order.id)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-2 bg-gray-200 rounded-full w-12" />
          <div className="h-3.5 bg-gray-200 rounded-full w-44" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="flex gap-2.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
        ))}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyOrders({ filter }: { filter: Filter }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Package size={34} className="text-gray-300" />
      </div>
      <h3 className="text-base font-bold text-gray-700 mb-1">
        {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        {filter === 'all'
          ? "You haven't placed any orders yet. Start shopping!"
          : `You don't have any ${filter} orders right now.`}
      </p>
      {filter === 'all' && (
        <Link to={ROUTES.CUSTOMER.PRODUCTS}>
          <Button leftIcon={<ShoppingBag size={16} />}>Start Shopping</Button>
        </Link>
      )}
    </div>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'All Orders' },
  { key: 'active',    label: 'Active'     },
  { key: 'delivered', label: 'Delivered'  },
  { key: 'cancelled', label: 'Cancelled'  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const { data: orders = [], isLoading } = useOrders()

  const filtered = orders.filter((o) => matchesFilter(o, filter))
  const sorted   = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit flex-wrap">
        {FILTERS.map(({ key, label }) => {
          const count =
            key === 'all'
              ? orders.length
              : orders.filter((o) => matchesFilter(o, key)).length

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                filter === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-xs font-semibold ${
                    filter === key ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <OrderSkeleton key={n} />)}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyOrders filter={filter} />
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}
