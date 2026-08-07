import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks'
import { ROUTES, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants'
import { formatCurrency } from '@/utils'
import {
  Divider,
  PageHeader,
  QuantityControl,
  SummaryRow,
  SzEmptyState,
  TotalRow,
} from '@/common/components'
import type { CartItem } from '@/types'

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
    <div className="sz-cart-item">
      <Link
        to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)}
        className="sz-item-thumb"
      >
        <img src={product.image} alt={product.name} />
      </Link>

      <div className="sz-item-info">
        <div className="sz-item-cat">{product.category}</div>
        <Link
          to={ROUTES.CUSTOMER.PRODUCT_DETAIL.replace(':id', product.id)}
          className="sz-item-name"
        >
          {product.name}
        </Link>
        <div className="sz-item-unit-price">
          {formatCurrency(product.discountedPrice)}
          {product.discountPercentage > 0 && (
            <span className="orig">{formatCurrency(product.price)}</span>
          )}
        </div>

        <QuantityControl
          value={quantity}
          max={product.stock}
          onChange={(next) => onUpdateQty(product.id, next)}
        />
      </div>

      <div className="sz-item-right">
        <button
          onClick={() => onRemove(product.id)}
          className="sz-item-remove"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
        <span className="sz-item-total">{formatCurrency(lineTotal)}</span>
      </div>
    </div>
  )
}

function OrderSummary({
  subtotal,
  discountedSubtotal,
  itemCount,
}: {
  subtotal: number
  discountedSubtotal: number
  itemCount: number
}) {
  const savings = subtotal - discountedSubtotal
  const shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = discountedSubtotal + shipping
  const toFreeShipping = FREE_SHIPPING_THRESHOLD - discountedSubtotal
  const pctToFree = Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <aside className="sz-summary">
      <h2>Order Summary</h2>

      {shipping === 0 ? (
        <div className="sz-free-ship">🎉 You qualify for free shipping!</div>
      ) : (
        <div className="sz-shipping-progress">
          Add <strong>{formatCurrency(toFreeShipping)}</strong> more for free shipping!
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${pctToFree}%` }} />
          </div>
        </div>
      )}

      <SummaryRow
        label={<>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</>}
        value={formatCurrency(subtotal)}
        valueClassName="v"
      />

      {savings > 0.01 && (
        <SummaryRow
          label="Savings"
          value={`-${formatCurrency(savings)}`}
          valueClassName="savings"
        />
      )}

      <SummaryRow
        label="Shipping"
        value={shipping === 0 ? 'Free' : formatCurrency(shipping)}
        valueClassName={shipping === 0 ? 'free' : 'v'}
      />

      <Divider />

      <TotalRow value={formatCurrency(total)} note="Tax included" />

      <Link to={ROUTES.CUSTOMER.CHECKOUT}>
        <button className="sz-btn-checkout">
          Proceed to Checkout <ArrowRight size={16} />
        </button>
      </Link>

      <Link to={ROUTES.CUSTOMER.PRODUCTS} className="sz-continue-center">
        Continue Shopping ›
      </Link>
      <div className="sz-secure-note">🔒 Secure checkout</div>

      <div className="sz-pay-icons">
        {['Visa', 'MC', 'Amex', 'PayPal'].map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>
    </aside>
  )
}

function EmptyCart() {
  return (
    <SzEmptyState
      icon={<ShoppingBag size={40} />}
      title="Your cart is empty"
      description="Looks like you haven't added anything yet."
      action={
        <Link to={ROUTES.CUSTOMER.PRODUCTS}>
          <button className="sz-btn-shop">
            <ShoppingBag size={17} /> Start Shopping
          </button>
        </Link>
      }
    />
  )
}

export default function CartPage() {
  const { items, isEmpty, updateQuantity, removeItem } = useCart()

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const discountedSubtotal = items.reduce(
    (sum, i) => sum + i.product.discountedPrice * i.quantity,
    0,
  )
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  if (isEmpty) return <div className="sz-cart"><EmptyCart /></div>

  return (
    <div className="sz-cart">
      <PageHeader
        title="Shopping Cart"
        subtitle={<>{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</>}
      />

      <div className="sz-cart-layout">
        <div className="sz-cart-panel">
          <div className="sz-col-head">
            <span>Product</span>
            <span>Total</span>
          </div>

          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          <div className="sz-cart-foot">
            <Link to={ROUTES.CUSTOMER.PRODUCTS} className="sz-continue-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <OrderSummary
          subtotal={subtotal}
          discountedSubtotal={discountedSubtotal}
          itemCount={itemCount}
        />
      </div>
    </div>
  )
}
