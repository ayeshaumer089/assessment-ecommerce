import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Clock, Truck, CheckCircle2, XCircle, ShoppingBag,
  ChevronDown, ChevronUp, MapPin, CreditCard,
} from 'lucide-react'
import { useOrders, useCancelOrder } from '@/hooks/useOrders'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { Order, OrderStatus } from '@/types'

type Filter = 'all' | 'active' | 'delivered' | 'cancelled'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; pillClass: string; icClass: string; Icon: React.FC<{ size?: number }> }
> = {
  pending:    { label: 'Pending',    pillClass: 'sz-pill-pending',    icClass: 'sz-ic-pending',    Icon: Clock      },
  processing: { label: 'Processing', pillClass: 'sz-pill-processing', icClass: 'sz-ic-processing', Icon: Package    },
  shipped:    { label: 'Shipped',    pillClass: 'sz-pill-shipped',    icClass: 'sz-ic-shipped',    Icon: Truck      },
  delivered:  { label: 'Delivered',  pillClass: 'sz-pill-delivered',  icClass: 'sz-ic-delivered',  Icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  pillClass: 'sz-pill-cancelled',  icClass: 'sz-ic-cancelled',  Icon: XCircle    },
}

function matchesFilter(order: Order, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'active') return ['pending', 'processing', 'shipped'].includes(order.status)
  return order.status === filter
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'All Orders' },
  { key: 'active',    label: 'Active'     },
  { key: 'delivered', label: 'Delivered'  },
  { key: 'cancelled', label: 'Cancelled'  },
]

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()

  const cfg       = STATUS_CONFIG[order.status]
  const canCancel = order.status === 'pending' || order.status === 'processing'
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
  const preview   = order.items.slice(0, 3)
  const extra     = order.items.length - 3

  return (
    <div className="sz-order-card">
      {/* Top */}
      <div className="sz-order-top">
        <div className="sz-order-id-block">
          <div className={`sz-status-ic ${cfg.icClass}`}>
            <cfg.Icon size={17} />
          </div>
          <div>
            <div className="sz-order-id-lbl">Order ID</div>
            <div className="sz-order-id-val">{order.id}</div>
          </div>
        </div>
        <div className="sz-order-meta-right">
          <span className={`sz-status-pill ${cfg.pillClass}`}>
            <span className="dot" />
            {cfg.label}
          </span>
          <span className="sz-order-date">{formatDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="sz-order-body">
        <div className="sz-thumb-stack">
          {preview.map(({ product }) => (
            <div key={product.id} className="th">
              <img src={product.image} alt={product.name} />
            </div>
          ))}
          {extra > 0 && <div className="th th-extra">+{extra}</div>}
        </div>
        <div className="sz-order-totals">
          <div className="sz-order-items-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
          <div className="sz-order-total-amt">{formatCurrency(order.total)}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="sz-order-foot">
        <button className="sz-toggle-link" onClick={() => setExpanded((v) => !v)}>
          {expanded ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> View Details</>}
        </button>
        {canCancel && (
          <button
            className="sz-btn-cancel"
            disabled={isCancelling}
            onClick={() => cancelOrder(order.id)}
          >
            {isCancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="sz-order-details">
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="sz-detail-item">
              <div className="sz-detail-thumb">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="sz-detail-info">
                <div className="sz-detail-name">{product.name}</div>
                <div className="sz-detail-qty">Qty {quantity} × {formatCurrency(product.discountedPrice)}</div>
              </div>
              <div className="sz-detail-price">
                {formatCurrency(product.discountedPrice * quantity)}
              </div>
            </div>
          ))}

          <div className="sz-summary-rows">
            <div className="sz-srow"><span>Subtotal</span><span>{formatCurrency(order.discountedTotal)}</span></div>
            {order.subtotal - order.discountedTotal > 0.01 && (
              <div className="sz-srow"><span>Savings</span><span className="savings">-{formatCurrency(order.subtotal - order.discountedTotal)}</span></div>
            )}
            <div className="sz-srow">
              <span>Shipping</span>
              <span>{order.total - order.discountedTotal <= 0.01 ? 'Free' : formatCurrency(order.total - order.discountedTotal)}</span>
            </div>
            <div className="sz-srow total"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </div>

          <div className="sz-ship-pay-row">
            <div className="sz-sp-block">
              <div className="sz-sp-label"><MapPin size={11} /> Shipped To</div>
              <div className="sz-sp-val">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
            <div className="sz-sp-block">
              <div className="sz-sp-label"><CreditCard size={11} /> Payment</div>
              <div className="sz-sp-val">{order.paymentMethod}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div className="sz-skel-card" style={{ animation: 'fade-in .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: '#ECE8F6' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 10, width: '30%', background: '#ECE8F6', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 14, width: '60%', background: '#ECE8F6', borderRadius: 6 }} />
        </div>
        <div style={{ height: 26, width: 80, background: '#ECE8F6', borderRadius: 100 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ width: 64, height: 64, borderRadius: 12, background: '#ECE8F6' }} />
        ))}
      </div>
    </div>
  )
}

function EmptyOrders({ filter }: { filter: Filter }) {
  return (
    <div className="sz-empty">
      <div className="icon-wrap"><Package size={34} /></div>
      <h3>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h3>
      <p>
        {filter === 'all'
          ? "You haven't placed any orders yet. Start shopping!"
          : `You don't have any ${filter} orders right now.`}
      </p>
      {filter === 'all' && (
        <Link to={ROUTES.CUSTOMER.PRODUCTS}>
          <button className="sz-btn-shop">
            <ShoppingBag size={16} /> Start Shopping
          </button>
        </Link>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const { data: orders = [], isLoading } = useOrders()

  const filtered = orders.filter((o) => matchesFilter(o, filter))
  const sorted   = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="sz-orders">
      <div className="sz-page-head">
        <h1>My Orders</h1>
        <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'} total</p>
      </div>

      <div className="sz-tabs">
        {FILTERS.map(({ key, label }) => {
          const count = key === 'all'
            ? orders.length
            : orders.filter((o) => matchesFilter(o, key)).length
          return (
            <button
              key={key}
              className={`sz-tab${filter === key ? ' active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="count">{count}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="sz-skel">
          {[1, 2, 3].map((n) => <OrderSkeleton key={n} />)}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyOrders filter={filter} />
      ) : (
        <div className="sz-list">
          {sorted.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}
