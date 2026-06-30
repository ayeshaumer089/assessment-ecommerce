import { Link, useLocation, Navigate } from 'react-router-dom'
import { Package, Clock, ShoppingBag, MapPin, CreditCard } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
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
            <div className="sz-sum-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.discountedTotal)}</span>
            </div>
            {hasSaving && (
              <div className="sz-sum-row">
                <span>Savings</span>
                <span className="savings">
                  -{formatCurrency(order.subtotal - order.discountedTotal)}
                </span>
              </div>
            )}
            <div className="sz-sum-row">
              <span>Shipping</span>
              <span className={shipping <= 0.01 ? 'free' : ''}>
                {shipping <= 0.01 ? 'Free' : formatCurrency(shipping)}
              </span>
            </div>
          </div>

          <div className="sz-total-row">
            <span className="lbl">Total</span>
            <span className="amt">{formatCurrency(order.total)}</span>
          </div>

          {/* Shipping + Payment */}
          <div className="sz-ship-pay-row">
            <div className="sz-sp-block">
              <div className="sz-sp-label">
                <MapPin size={11} /> Shipping To
              </div>
              <div className="sz-sp-val">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
            <div className="sz-sp-block">
              <div className="sz-sp-label">
                <CreditCard size={11} /> Payment
              </div>
              <div className="sz-sp-val">{order.paymentMethod}</div>
              <div className="sz-sp-note">Demo checkout — no charge applied</div>
            </div>
          </div>
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
