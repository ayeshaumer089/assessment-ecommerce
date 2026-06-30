import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants/shipping'
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

        <div className="sz-qty-control">
          <button
            onClick={() => onUpdateQty(product.id, quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="qval">{quantity}</span>
          <button
            onClick={() => onUpdateQty(product.id, quantity + 1)}
            disabled={quantity >= product.stock}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>
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

      <div className="sz-sum-row">
        <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        <span className="v">{formatCurrency(subtotal)}</span>
      </div>

      {savings > 0.01 && (
        <div className="sz-sum-row">
          <span>Savings</span>
          <span className="savings">-{formatCurrency(savings)}</span>
        </div>
      )}

      <div className="sz-sum-row">
        <span>Shipping</span>
        <span className={shipping === 0 ? 'free' : 'v'}>
          {shipping === 0 ? 'Free' : formatCurrency(shipping)}
        </span>
      </div>

      <hr className="sz-divider" />

      <div className="sz-total-row">
        <span className="lbl">Total</span>
        <span className="amt">{formatCurrency(total)}</span>
      </div>
      <div className="sz-tax-note">Tax included</div>

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
    <div className="sz-empty">
      <div className="icon-wrap">
        <ShoppingBag size={40} />
      </div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven&apos;t added anything yet.</p>
      <Link to={ROUTES.CUSTOMER.PRODUCTS}>
        <button className="sz-btn-shop">
          <ShoppingBag size={17} /> Start Shopping
        </button>
      </Link>
    </div>
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
      <div className="sz-page-head">
        <h1>Shopping Cart</h1>
        <p>{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
      </div>

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
