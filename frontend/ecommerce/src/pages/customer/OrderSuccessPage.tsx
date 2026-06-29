import { Link, useLocation, Navigate } from 'react-router-dom'
import { CheckCircle2, Package, Clock, ShoppingBag, MapPin, CreditCard } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import Button from '@/components/ui/Button'
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

  const now         = new Date()
  const minDelivery = addBusinessDays(now, 5)
  const maxDelivery = addBusinessDays(now, 7)
  const fmt         = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const deliveryRange = `${fmt(minDelivery)} – ${maxDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const shipping = order.total - order.discountedTotal

  return (
    <div className="max-w-2xl mx-auto py-10">
      {/* Success hero */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500">
          Thank you for your purchase. Your order is confirmed.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          A confirmation has been sent to your email.
        </p>
      </div>

      {/* Order ID */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <Package size={15} className="text-indigo-500" />
          <span className="text-sm text-gray-500">Order</span>
          <span className="font-mono font-bold text-gray-900 text-sm">{order.id}</span>
        </div>
      </div>

      {/* Estimated delivery */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Clock size={20} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">Estimated Delivery</p>
          <p className="text-sm text-indigo-700">{deliveryRange}</p>
        </div>
      </div>

      {/* Order details */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Order Summary</h2>

        <div className="space-y-3 mb-5">
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
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

        <div className="h-px bg-gray-100 mb-4" />

        <div className="space-y-2 text-sm">
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
            <span className={shipping <= 0.01 ? 'text-emerald-600 font-medium' : ''}>
              {shipping <= 0.01 ? 'Free' : formatCurrency(shipping)}
            </span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between items-center font-bold text-gray-900">
            <span className="text-base">Total</span>
            <span className="text-xl">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping + Payment info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
              <MapPin size={12} className="text-indigo-400" /> SHIPPING TO
            </p>
            <p className="text-sm text-gray-800">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
              <CreditCard size={12} className="text-indigo-400" /> PAYMENT
            </p>
            <p className="text-sm text-gray-800">{order.paymentMethod}</p>
            <p className="text-xs text-gray-400 mt-1">Demo checkout — no charge applied</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={ROUTES.CUSTOMER.ORDERS} className="flex-1">
          <Button variant="outline" size="lg" fullWidth leftIcon={<Package size={17} />}>
            View Order History
          </Button>
        </Link>
        <Link to={ROUTES.CUSTOMER.PRODUCTS} className="flex-1">
          <Button size="lg" fullWidth leftIcon={<ShoppingBag size={17} />}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}
