import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin, CreditCard, ClipboardCheck, CheckCircle,
  Lock, Tag, Truck, ArrowLeft, ChevronRight, Eye, EyeOff,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useOrders'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants/shipping'
import type { CartItem } from '@/types'

// ── Schemas ───────────────────────────────────────────────────────────────────
const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Enter a valid email'),
  phone:     z.string().optional(),
  street:    z.string().min(3, 'Enter your street address'),
  apt:       z.string().optional(),
  city:      z.string().min(1, 'City is required'),
  state:     z.string().min(1, 'State is required'),
  zipCode:   z.string().min(3, 'Enter a valid zip code').max(10),
  country:   z.string().min(1, 'Country is required'),
})

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, 'Enter a valid 16-digit card number'),
  nameOnCard: z.string().min(2, 'Name is required'),
  expiry:     z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv:        z.string().regex(/^\d{3,4}$/, 'Enter 3 or 4 digits'),
})

type ShippingData = z.infer<typeof shippingSchema>
type PaymentData  = z.infer<typeof paymentSchema>
type Step         = 'shipping' | 'payment' | 'review'

function fmtCard(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 16)
  return d.replace(/(.{4})/g, '$1 ').trim()
}
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEP_DEFS = [
  { key: 'shipping', label: 'Shipping', Icon: MapPin },
  { key: 'payment',  label: 'Payment',  Icon: CreditCard },
  { key: 'review',   label: 'Review',   Icon: ClipboardCheck },
] as const

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEP_DEFS.findIndex((s) => s.key === current)
  return (
    <div className="sz-stepper">
      <div className="sz-stepper-inner">
        {STEP_DEFS.map(({ key, label, Icon }, idx) => {
          const done   = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`sz-step${active ? ' active' : ''}${done ? ' done' : ''}`}>
                <div className="sz-step-circle">
                  {done ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <div className="sz-step-label">{label}</div>
              </div>
              {idx < STEP_DEFS.length - 1 && (
                <div className={`sz-step-line${idx < currentIdx ? ' done' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Order summary sidebar ──────────────────────────────────────────────────────
function CheckoutSummary({ items }: { items: CartItem[] }) {
  const subtotal   = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const discounted = items.reduce((s, i) => s + i.product.discountedPrice * i.quantity, 0)
  const savings    = subtotal - discounted
  const shipping   = discounted >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total      = discounted + shipping

  return (
    <aside className="sz-summary">
      <h2>Order Summary</h2>

      <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="sz-sum-item">
            <div className="sz-sum-thumb">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="sz-sum-item-info">
              <div className="nm">{product.name}</div>
              <div className="qty">Qty {quantity}</div>
            </div>
            <div className="sz-sum-item-price">
              {formatCurrency(product.discountedPrice * quantity)}
            </div>
          </div>
        ))}
      </div>

      <hr className="sz-divider" />

      <div className="sz-sum-row">
        <span>Subtotal</span>
        <span className="v">{formatCurrency(subtotal)}</span>
      </div>
      {savings > 0.01 && (
        <div className="sz-sum-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tag size={12} /> Savings
          </span>
          <span className="savings">-{formatCurrency(savings)}</span>
        </div>
      )}
      <div className="sz-sum-row">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Truck size={12} /> Shipping
        </span>
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

      <div className="sz-secure-row">
        <Lock size={12} /> Secure 256-bit SSL encryption
      </div>
    </aside>
  )
}

// ── Field helper ──────────────────────────────────────────────────────────────
function Field({
  label,
  optional,
  error,
  children,
  full,
}: {
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={`sz-field${full ? ' full' : ''}`}>
      <label>
        {label}
        {optional && <span className="opt">Optional</span>}
      </label>
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  )
}

// ── Shipping form ─────────────────────────────────────────────────────────────
function ShippingForm({
  onNext,
  defaultValues,
}: {
  onNext: (data: ShippingData) => void
  defaultValues?: Partial<ShippingData>
}) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<ShippingData>({ resolver: zodResolver(shippingSchema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="sz-panel-title">
        <MapPin size={20} className="ic" />
        Shipping Address
      </div>
      <div className="sz-panel-sub">Where should we deliver your order?</div>

      <div className="sz-form-grid">
        <Field label="First Name" error={errors.firstName?.message}>
          <input type="text" placeholder="John" {...register('firstName')} />
        </Field>
        <Field label="Last Name" error={errors.lastName?.message}>
          <input type="text" placeholder="Doe" {...register('lastName')} />
        </Field>
        <Field label="Email Address" error={errors.email?.message} full>
          <input type="email" placeholder="john@example.com" {...register('email')} />
        </Field>
        <Field label="Phone Number" optional error={errors.phone?.message} full>
          <input type="text" placeholder="+1 (555) 000-0000" {...register('phone')} />
        </Field>
        <Field label="Street Address" error={errors.street?.message} full>
          <input type="text" placeholder="123 Main Street" {...register('street')} />
        </Field>
        <Field label="Apartment / Suite" optional error={errors.apt?.message} full>
          <input type="text" placeholder="Apt 4B" {...register('apt')} />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <input type="text" placeholder="New York" {...register('city')} />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <input type="text" placeholder="NY" {...register('state')} />
        </Field>
        <Field label="ZIP Code" error={errors.zipCode?.message}>
          <input type="text" placeholder="10001" {...register('zipCode')} />
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <input type="text" placeholder="United States" {...register('country')} />
        </Field>
      </div>

      <button type="submit" className="sz-btn-main">
        Continue to Payment <ChevronRight size={16} />
      </button>
    </form>
  )
}

// ── Payment form ──────────────────────────────────────────────────────────────
function PaymentForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: PaymentData) => void
  onBack: () => void
  defaultValues?: Partial<PaymentData>
}) {
  const [showCvv, setShowCvv] = useState(false)
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<PaymentData>({ resolver: zodResolver(paymentSchema), defaultValues })

  const cardNumber = watch('cardNumber', '')
  const expiry     = watch('expiry', '')
  const segments   = cardNumber ? cardNumber.split(' ') : []

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="sz-panel-title">
        <CreditCard size={20} className="ic" />
        Payment Details
      </div>
      <div className="sz-panel-sub">Your payment information is encrypted and secure.</div>

      <div className="sz-card-visual">
        <div className="dots">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ fontFamily: 'monospace', letterSpacing: 3 }}>
              {segments[i] || '····'}
            </span>
          ))}
        </div>
        <div className="bottom"><CreditCard size={22} /></div>
      </div>

      <div className="sz-form-grid">
        <Field label="Card Number" error={errors.cardNumber?.message} full>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setValue('cardNumber', fmtCard(e.target.value), { shouldValidate: true })}
            inputMode="numeric"
            style={{ fontFamily: 'monospace', letterSpacing: 2 }}
          />
        </Field>
        <Field label="Name on Card" error={errors.nameOnCard?.message} full>
          <input type="text" placeholder="John Doe" {...register('nameOnCard')} />
        </Field>
        <Field label="Expiry Date" error={errors.expiry?.message}>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setValue('expiry', fmtExpiry(e.target.value), { shouldValidate: true })}
            inputMode="numeric"
            style={{ fontFamily: 'monospace' }}
          />
        </Field>
        <Field label="CVV" error={errors.cvv?.message}>
          <div className="sz-pwd-wrap">
            <input
              type={showCvv ? 'text' : 'password'}
              placeholder="•••"
              {...register('cvv')}
              inputMode="numeric"
              maxLength={4}
            />
            <button type="button" className="eye" onClick={() => setShowCvv((v) => !v)}>
              {showCvv ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>
      </div>

      <div className="sz-secure-note">
        <Lock size={13} /> This is a demo checkout — no real payment is processed.
      </div>

      <div className="sz-btn-row">
        <button type="button" className="sz-btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="submit" className="sz-btn-main">
          Review Order <ChevronRight size={16} />
        </button>
      </div>
    </form>
  )
}

// ── Review step ───────────────────────────────────────────────────────────────
function ReviewStep({
  shippingData,
  paymentData,
  onBack,
  onPlaceOrder,
  isPlacing,
  error,
}: {
  shippingData: ShippingData
  paymentData: PaymentData
  onBack: () => void
  onPlaceOrder: () => void
  isPlacing: boolean
  error?: string
}) {
  const maskedCard = `**** **** **** ${paymentData.cardNumber.replace(/\s/g, '').slice(-4)}`

  return (
    <div>
      <div className="sz-panel-title">
        <ClipboardCheck size={20} className="ic" />
        Review Your Order
      </div>
      <div className="sz-panel-sub">Please confirm your details before placing the order.</div>

      <div className="sz-review-block">
        <h3>Deliver To</h3>
        <div className="sz-review-card">
          <div className="rname">{shippingData.firstName} {shippingData.lastName}</div>
          {shippingData.street}{shippingData.apt ? `, ${shippingData.apt}` : ''}<br />
          {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
          {shippingData.country}<br />
          {shippingData.email}
          {shippingData.phone ? ` · ${shippingData.phone}` : ''}
        </div>
      </div>

      <div className="sz-review-block">
        <h3>Payment Method</h3>
        <div className="sz-review-card">
          <strong>{maskedCard}</strong><br />
          {paymentData.nameOnCard}<br />
          Expires {paymentData.expiry}
        </div>
      </div>

      {error && <div className="sz-err-banner">{error}</div>}

      <div className="sz-btn-row">
        <button type="button" className="sz-btn-back" onClick={onBack} disabled={isPlacing}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          className="sz-btn-main"
          onClick={onPlaceOrder}
          disabled={isPlacing}
        >
          <Lock size={15} />
          {isPlacing ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, isEmpty, clearCart } = useCart()
  const checkout = useCheckout()

  const [step,         setStep]         = useState<Step>('shipping')
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [paymentData,  setPaymentData]  = useState<PaymentData  | null>(null)
  const [orderError,   setOrderError]   = useState<string>('')

  if (isEmpty) return <Navigate to={ROUTES.CUSTOMER.CART} replace />

  function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

  function handleShippingNext(data: ShippingData) { setShippingData(data); setStep('payment'); scrollTop() }
  function handlePaymentNext(data: PaymentData)   { setPaymentData(data);  setStep('review'); scrollTop() }

  async function handlePlaceOrder() {
    setOrderError('')
    if (!shippingData || !paymentData) return
    const last4 = paymentData.cardNumber.replace(/\s/g, '').slice(-4)
    try {
      const result = await checkout.mutateAsync({
        shippingAddress: {
          fullName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
          phone: shippingData.phone,
          street: shippingData.street,
          apt: shippingData.apt,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
          country: shippingData.country,
        },
        paymentMethod: `Card (mock) •••• ${last4}`,
      })
      clearCart()
      navigate(ROUTES.CUSTOMER.CHECKOUT_SUCCESS, { state: { order: result.order }, replace: true })
    } catch (err: any) {
      setOrderError(
        err?.response?.data?.message || 'Something went wrong placing your order. Please try again.',
      )
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="sz-checkout">
      <div className="sz-page-head">
        <Link to={ROUTES.CUSTOMER.CART} className="sz-back-btn">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1>Checkout</h1>
          <div className="sub">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
        </div>
      </div>

      <StepIndicator current={step} />

      <div className="sz-layout">
        <div className="sz-panel">
          {step === 'shipping' && (
            <ShippingForm onNext={handleShippingNext} defaultValues={shippingData ?? undefined} />
          )}
          {step === 'payment' && (
            <PaymentForm
              onNext={handlePaymentNext}
              onBack={() => setStep('shipping')}
              defaultValues={paymentData ?? undefined}
            />
          )}
          {step === 'review' && shippingData && paymentData && (
            <ReviewStep
              shippingData={shippingData}
              paymentData={paymentData}
              onBack={() => setStep('payment')}
              onPlaceOrder={handlePlaceOrder}
              isPlacing={checkout.isPending}
              error={orderError}
            />
          )}
        </div>

        <CheckoutSummary items={items} />
      </div>
    </div>
  )
}
