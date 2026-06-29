import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronRight, Tag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants/shipping'
import Button from '@/components/ui/Button'
import type { CartItem } from '@/types'

// ── Line item row ─────────────────────────────────────────────────────────────
function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  const { product, quantity } = item
  const lineTotal = product.discountedPrice * quantity

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link
        to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)}
        className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-indigo-500 leading-none mb-1">
              {product.category}
            </span>
            <Link
              to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)}
              className="text-sm font-semibold text-gray-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
          </div>
          {/* Remove button */}
          <button
            onClick={() => onRemove(product.id)}
            className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Unit price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(product.discountedPrice)}
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Bottom row: qty + line total */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-1">
          {/* Quantity control */}
          <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => onUpdateQty(product.id, quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="w-9 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-bold text-gray-900">{formatCurrency(lineTotal)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Order summary panel ───────────────────────────────────────────────────────
function OrderSummary({
  subtotal,
  discountedSubtotal,
  itemCount,
}: {
  subtotal: number
  discountedSubtotal: number
  itemCount: number
}) {
  const savings  = subtotal - discountedSubtotal
  const shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total    = discountedSubtotal + shipping

  const toFreeShipping = FREE_SHIPPING_THRESHOLD - discountedSubtotal
  const pctToFree = Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <h2 className="text-base font-bold text-gray-900">Order Summary</h2>

      {/* Free shipping progress */}
      {shipping > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <p className="font-medium">
            Add <span className="font-bold">{formatCurrency(toFreeShipping)}</span> more for free shipping!
          </p>
          <div className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${pctToFree}%` }}
            />
          </div>
        </div>
      )}
      {shipping === 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2">
          🎉 You qualify for free shipping!
        </div>
      )}

      {/* Line items */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
        </div>

        {savings > 0.01 && (
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1.5">
              <Tag size={13} /> Savings
            </span>
            <span className="font-semibold">-{formatCurrency(savings)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'font-medium text-gray-800'}>
            {shipping === 0 ? 'Free' : formatCurrency(shipping)}
          </span>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex justify-between items-end">
          <span className="font-bold text-gray-900">Total</span>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
            <p className="text-[11px] text-gray-400">Tax included</p>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <Link to={ROUTES.CUSTOMER.CHECKOUT}>
        <Button size="lg" fullWidth rightIcon={<ArrowRight size={16} />}>
          Proceed to Checkout
        </Button>
      </Link>

      {/* Continue shopping */}
      <Link
        to={ROUTES.CUSTOMER.PRODUCTS}
        className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        Continue Shopping <ChevronRight size={13} />
      </Link>

      {/* Payment icons */}
      <div className="pt-1 flex flex-col items-center gap-2">
        <p className="text-[11px] text-gray-400">Secure checkout</p>
        <div className="flex gap-2">
          {['Visa', 'MC', 'Amex', 'PayPal'].map((p) => (
            <span
              key={p}
              className="px-2 py-1 text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Empty cart ────────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
      <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center">
        <ShoppingBag size={40} className="text-indigo-300" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-1">
          Looks like you haven&apos;t added anything yet.
        </p>
      </div>
      <Link to={ROUTES.CUSTOMER.PRODUCTS}>
        <Button size="lg" leftIcon={<ShoppingBag size={17} />}>
          Start Shopping
        </Button>
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { items, isEmpty, updateQuantity, removeItem } = useCart()

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  )
  const discountedSubtotal = items.reduce(
    (sum, i) => sum + i.product.discountedPrice * i.quantity,
    0,
  )
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  if (isEmpty) return <EmptyCart />

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Cart items ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-5">
          {/* Table header — desktop only */}
          <div className="hidden sm:grid grid-cols-[1fr_auto] gap-4 py-3 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <span>Product</span>
            <span className="text-right">Total</span>
          </div>

          {/* Items */}
          <div>
            {items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQty={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="py-4 flex items-center justify-between border-t border-gray-100">
            <Link
              to={ROUTES.CUSTOMER.PRODUCTS}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Order summary (sticky on desktop) ──────────────────────── */}
        <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-24 shrink-0">
          <OrderSummary
            subtotal={subtotal}
            discountedSubtotal={discountedSubtotal}
            itemCount={itemCount}
          />
        </div>
      </div>
    </div>
  )
}
