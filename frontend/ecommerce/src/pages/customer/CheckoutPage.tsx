import { useEffect, useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import {
  MapPin, CreditCard, ClipboardCheck, CheckCircle,
  Lock, Tag, Truck, ArrowLeft, ChevronRight, Loader2,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useOrders'
import { useCreatePaymentIntent } from '@/hooks/usePayment'
import { paymentService } from '@/services/paymentService'
import { getStripe, STRIPE_APPEARANCE } from '@/lib/stripe'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants/shipping'
import type { CartItem } from '@/types'

// Stripe.js is loaded once for the whole module — see lib/stripe.ts.
const stripePromise = getStripe()

// Survives the full-page redirect some payment methods (wallets, BNPL) perform.
// Card payments resolve in-page, but this keeps the flow intact for the rest.
const CHECKOUT_STATE_KEY = 'sz:checkout:state'

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

// Card number, expiry and CVC are collected inside Stripe's hosted iframe and
// never reach this origin — so the only card field this app still owns is the
// cardholder name.
const paymentSchema = z.object({
  nameOnCard: z.string().min(2, 'Name is required'),
})

type ShippingData    = z.infer<typeof shippingSchema>
type PaymentFormData = z.infer<typeof paymentSchema>
type Step            = 'shipping' | 'payment' | 'review'

/** What the review step displays — read back from Stripe after confirmation. */
interface PaymentData {
  cardNumber: string
  nameOnCard: string
  expiry: string
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

// ── Payment form (Stripe Elements) ────────────────────────────────────────────
/**
 * Confirms the PaymentIntent before advancing to review. Doing it here is what
 * lets the review step show the real brand and last-4, instead of whatever was
 * typed into an unvalidated text box.
 */
function PaymentForm({
  onNext,
  onBack,
  clientSecret,
  defaultValues,
}: {
  onNext: (nameOnCard: string) => Promise<void>
  onBack: () => void
  clientSecret: string
  defaultValues?: Partial<PaymentFormData>
}) {
  const stripe   = useStripe()
  const elements = useElements()

  const [isPaying,    setIsPaying]    = useState(false)
  const [stripeError, setStripeError] = useState('')

  const { register, handleSubmit, formState: { errors } } =
    useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema), defaultValues })

  async function onSubmit(data: PaymentFormData) {
    if (!stripe || !elements) return

    setIsPaying(true)
    setStripeError('')

    // Stepping Back from review returns here with an intent that is already
    // paid. Confirming it a second time is an error, so just move forward.
    const existing = await stripe.retrievePaymentIntent(clientSecret)
    if (existing.paymentIntent?.status === 'succeeded') {
      await onNext(data.nameOnCard)
      setIsPaying(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Only used by methods that navigate away; cards resolve in-page.
        return_url: `${window.location.origin}${ROUTES.CUSTOMER.CHECKOUT}`,
        payment_method_data: { billing_details: { name: data.nameOnCard } },
      },
      redirect: 'if_required',
    })

    if (error) {
      // card_error / validation_error are written for shoppers and safe to show
      // verbatim; any other type could leak internals, so it gets a generic one.
      setStripeError(
        error.type === 'card_error' || error.type === 'validation_error'
          ? error.message || 'Your card could not be processed.'
          : 'Something went wrong processing your payment. Please try again.',
      )
      setIsPaying(false)
      return
    }

    if (paymentIntent?.status !== 'succeeded') {
      setStripeError('Your payment could not be completed. Please try another card.')
      setIsPaying(false)
      return
    }

    await onNext(data.nameOnCard)
    setIsPaying(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="sz-panel-title">
        <CreditCard size={20} className="ic" />
        Payment Details
      </div>
      <div className="sz-panel-sub">Your payment information is encrypted and secure.</div>

      <div className="sz-card-visual">
        <div className="dots">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ fontFamily: 'monospace', letterSpacing: 3 }}>
              ····
            </span>
          ))}
        </div>
        <div className="bottom"><CreditCard size={22} /></div>
      </div>

      <div className="sz-form-grid">
        <div className="sz-field full">
          <PaymentElement
            options={{
              layout: 'tabs',
              // The cardholder name has its own field below, so Stripe must
              // not collect it a second time.
              fields: { billingDetails: { name: 'never' } },
            }}
          />
        </div>
        <Field label="Name on Card" error={errors.nameOnCard?.message} full>
          <input type="text" placeholder="John Doe" {...register('nameOnCard')} />
        </Field>
      </div>

      {stripeError && <div className="sz-err-banner">{stripeError}</div>}

      <div className="sz-secure-note">
        <Lock size={13} /> Payments are processed securely by Stripe — card details never touch our servers.
      </div>

      <div className="sz-btn-row">
        <button type="button" className="sz-btn-back" onClick={onBack} disabled={isPaying}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="submit" className="sz-btn-main" disabled={!stripe || isPaying}>
          {isPaying ? 'Confirming Payment…' : 'Review Order'}
          {isPaying ? null : <ChevronRight size={16} />}
        </button>
      </div>
    </form>
  )
}

// ── Payment step shell ────────────────────────────────────────────────────────
/**
 * PaymentElement can only mount once a clientSecret exists, so this owns the
 * loading and error states around it.
 */
function PaymentStep({
  clientSecret,
  intentError,
  onRetry,
  onBack,
  children,
}: {
  clientSecret: string | null
  intentError: string
  onRetry: () => void
  onBack: () => void
  children: React.ReactNode
}) {
  if (clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
      >
        {children}
      </Elements>
    )
  }

  return (
    <div>
      <div className="sz-panel-title">
        <CreditCard size={20} className="ic" />
        Payment Details
      </div>
      <div className="sz-panel-sub">Your payment information is encrypted and secure.</div>

      {intentError ? (
        <>
          <div className="sz-err-banner">{intentError}</div>
          <div className="sz-btn-row">
            <button type="button" className="sz-btn-back" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" className="sz-btn-main" onClick={onRetry}>
              Try Again <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="sz-secure-note" style={{ marginTop: 28 }}>
          <Loader2 size={14} className="animate-spin" /> Setting up secure payment…
        </div>
      )}
    </div>
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
  const createIntent = useCreatePaymentIntent()

  const [step,         setStep]         = useState<Step>('shipping')
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [paymentData,  setPaymentData]  = useState<PaymentData  | null>(null)
  const [orderError,   setOrderError]   = useState<string>('')

  const [clientSecret,    setClientSecret]    = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [intentError,     setIntentError]     = useState<string>('')

  function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

  function toShippingAddress(data: ShippingData) {
    return {
      fullName: `${data.firstName} ${data.lastName}`.trim(),
      phone: data.phone,
      street: data.street,
      apt: data.apt,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
    }
  }

  /** Reads the confirmed card's brand / last-4 / expiry back for the recap. */
  async function hydrateReviewFromIntent(intentId: string, nameOnCard: string) {
    let cardNumber = '**** **** **** ····'
    let expiry     = '••/••'

    try {
      const summary = await paymentService.getIntent(intentId)
      if (summary.card?.last4) cardNumber = `**** **** **** ${summary.card.last4}`
      if (summary.card?.expMonth && summary.card?.expYear) {
        expiry = `${String(summary.card.expMonth).padStart(2, '0')}/${String(summary.card.expYear).slice(-2)}`
      }
    } catch {
      // Non-fatal — the payment already succeeded; this only affects the recap.
    }

    setPaymentData({ cardNumber, nameOnCard, expiry })
    setStep('review')
    scrollTop()
  }

  // Restore the wizard when a payment method redirected the browser away.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirectStatus = params.get('redirect_status')
    if (!redirectStatus) return

    const raw = sessionStorage.getItem(CHECKOUT_STATE_KEY)
    window.history.replaceState({}, '', ROUTES.CUSTOMER.CHECKOUT)
    if (!raw) return

    try {
      const saved = JSON.parse(raw) as {
        shippingData: ShippingData
        nameOnCard: string
        paymentIntentId: string
      }
      setShippingData(saved.shippingData)
      setPaymentIntentId(saved.paymentIntentId)

      if (redirectStatus === 'succeeded') {
        void hydrateReviewFromIntent(saved.paymentIntentId, saved.nameOnCard)
      } else {
        setOrderError('Your payment was not completed. Please try again.')
      }
    } catch {
      sessionStorage.removeItem(CHECKOUT_STATE_KEY)
    }
    // Mount-only: the redirect result is read from the URL, not from props.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Once the payment has been confirmed the cart is no longer the source of
  // truth for this flow, so an empty cart must not bounce the customer away.
  if (isEmpty && step !== 'review') return <Navigate to={ROUTES.CUSTOMER.CART} replace />

  /** Opens (or re-prices) the PaymentIntent for the cart as it stands now. */
  async function openPaymentIntent(data: ShippingData) {
    setIntentError('')
    setClientSecret(null)
    try {
      const intent = await createIntent.mutateAsync({
        shippingAddress: toShippingAddress(data),
      })
      setClientSecret(intent.clientSecret)
      setPaymentIntentId(intent.paymentIntentId)
    } catch (err: any) {
      setIntentError(
        err?.response?.data?.message ||
          'We could not start a secure payment session. Please try again.',
      )
    }
  }

  function handleShippingNext(data: ShippingData) {
    setShippingData(data)
    setStep('payment')
    scrollTop()
    void openPaymentIntent(data)
  }

  async function handlePaymentNext(nameOnCard: string) {
    if (paymentIntentId && shippingData) {
      // Written before any redirect-based method can navigate away.
      sessionStorage.setItem(
        CHECKOUT_STATE_KEY,
        JSON.stringify({ shippingData, nameOnCard, paymentIntentId }),
      )
    }
    await hydrateReviewFromIntent(paymentIntentId as string, nameOnCard)
  }

  async function handlePlaceOrder() {
    setOrderError('')
    if (!shippingData || !paymentData) return
    try {
      const result = await checkout.mutateAsync({
        shippingAddress: toShippingAddress(shippingData),
        // Left off deliberately: the server labels the order from the real
        // card brand Stripe reports, not from anything the client asserts.
        paymentIntentId: paymentIntentId || undefined,
      })
      sessionStorage.removeItem(CHECKOUT_STATE_KEY)
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
            <PaymentStep
              clientSecret={clientSecret}
              intentError={intentError}
              onRetry={() => shippingData && void openPaymentIntent(shippingData)}
              onBack={() => setStep('shipping')}
            >
              <PaymentForm
                onNext={handlePaymentNext}
                onBack={() => setStep('shipping')}
                clientSecret={clientSecret as string}
                defaultValues={
                  paymentData ? { nameOnCard: paymentData.nameOnCard } : undefined
                }
              />
            </PaymentStep>
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
