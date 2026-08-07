import { Link, useLocation, Navigate } from 'react-router-dom'
import { Package, Clock, ShoppingBag } from 'lucide-react'
import { ROUTES } from '@/constants'
import { formatCurrency } from '@/utils'
import { AddressPaymentRow, SummaryRow, TotalRow } from '@/common/components'
import type { Order } from '@/types'

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return result
}

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const order = state?.order as Order | undefined

  if (!order) return <Navigate to={ROUTES.CUSTOMER.ORDERS} replace />

  const now           = new Date()
  const minDelivery   = addBusinessDays(now, 5)
  const maxDelivery   = addBusinessDays(now, 7)
  const fmt           = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const deliveryRange = `${fmt(minDelivery)} – ${maxDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const shipping  = order.total - order.discountedTotal
  const hasSaving = order.subtotal - order.discountedTotal > 0.01

  return (
    <div className="sz-success">

      {/* ── Hero ── */}
      <div className="sz-success-wrap">
        <div className="sz-glow" />

        <div className="sz-check-circle">✓</div>

        <h1>Order Placed!</h1>
        <p className="tagline">Thank you for your purchase. Your order is confirmed.</p>
        <p className="small">A confirmation has been sent to your email.</p>

        <div className="sz-order-id-chip">
          <Package size={14} /> Order <span className="val">{order.id}</span>
        </div>

        <div className="sz-delivery-banner">
          <div className="sz-delivery-ic">
            <Clock size={18} />
          </div>
          <div>
            <div className="sz-delivery-label">Estimated Delivery</div>
            <div className="sz-delivery-dates">{deliveryRange}</div>
          </div>
        </div>
      </div>

      {/* ── Order summary panel ── */}
      <div className="sz-summary-panel">
        <div className="sz-panel-card">
          <div className="sz-panel-head">Order Summary</div>

          {/* Items */}
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="sz-item-row">
              <div className="sz-item-thumb">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="sz-item-info">
                <div className="sz-item-name">{product.name}</div>
                <div className="sz-item-qty">
                  Qty {quantity} × {formatCurrency(product.discountedPrice)}
                </div>
              </div>
              <div className="sz-item-price">
                {formatCurrency(product.discountedPrice * quantity)}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="sz-totals-block">
            <SummaryRow label="Subtotal" value={formatCurrency(order.discountedTotal)} />
            {hasSaving && (
              <SummaryRow
                label="Savings"
                value={`-${formatCurrency(order.subtotal - order.discountedTotal)}`}
                valueClassName="savings"
              />
            )}
            <SummaryRow
              label="Shipping"
              value={shipping <= 0.01 ? 'Free' : formatCurrency(shipping)}
              valueClassName={shipping <= 0.01 ? 'free' : ''}
            />
          </div>

          <TotalRow value={formatCurrency(order.total)} />

          {/* Shipping + Payment */}
          <AddressPaymentRow
            address={order.shippingAddress}
            paymentMethod={order.paymentMethod}
            addressLabel="Shipping To"
            paymentNote="Demo checkout — no charge applied"
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="sz-actions">
        <Link to={ROUTES.CUSTOMER.ORDERS} style={{ flex: 1, display: 'contents' }}>
          <button className="sz-btn-outline">
            <Package size={16} /> View Order History
          </button>
        </Link>
        <Link to={ROUTES.CUSTOMER.PRODUCTS} style={{ flex: 1, display: 'contents' }}>
          <button className="sz-btn-fill">
            <ShoppingBag size={16} /> Continue Shopping
          </button>
        </Link>
      </div>

    </div>
  )
}
