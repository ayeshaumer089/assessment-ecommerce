import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin, CreditCard, ClipboardCheck, CheckCircle,
  Lock, Truck, Tag, ArrowLeft, ChevronRight, Eye, EyeOff,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useOrders'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants/shipping'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtCard(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 16)
  return d.replace(/(.{4})/g, '$1 ').trim()
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEP_DEFS = [
  { key: 'shipping', label: 'Shipping', Icon: MapPin },
  { key: 'payment',  label: 'Payment',  Icon: CreditCard },
  { key: 'review',   label: 'Review',   Icon: ClipboardCheck },
] as const

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEP_DEFS.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_DEFS.map(({ key, label, Icon }, idx) => {
        const done   = idx < currentIdx
        const active = idx === currentIdx
        return (
          <div key={key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  done   ? 'bg-indigo-600 text-white shadow-md' : '',
                  active ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : '',
                  !done && !active ? 'bg-gray-100 text-gray-400' : '',
                ].join(' ')}
              >
                {done ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`text-xs font-semibold ${
                  active ? 'text-indigo-600' : done ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEP_DEFS.length - 1 && (
              <div
                className={`w-16 h-0.5 mb-5 mx-2 transition-colors ${
                  idx < currentIdx ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Checkout summary (sidebar) ────────────────────────────────────────────────
function CheckoutSummary({ items }: { items: CartItem[] }) {
  const subtotal   = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const discounted = items.reduce((s, i) => s + i.product.discountedPrice * i.quantity, 0)
  const savings    = subtotal - discounted
  const shipping   = discounted >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total      = discounted + shipping

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <h2 className="text-base font-bold text-gray-900">Order Summary</h2>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{product.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Qty {quantity}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900 shrink-0">
              {formatCurrency(product.discountedPrice * quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-100" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
        </div>
        {savings > 0.01 && (
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1">
              <Tag size={12} /> Savings
            </span>
            <span className="font-semibold">-{formatCurrency(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1">
            <Truck size={12} /> Shipping
          </span>
          <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'font-medium text-gray-800'}>
            {shipping === 0 ? 'Free' : formatCurrency(shipping)}
          </span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">Total</span>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(total)}</p>
            <p className="text-[11px] text-gray-400">Tax included</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock size={12} />
        Secure 256-bit SSL encryption
      </div>
    </div>
  )
}

// ── Shipping form (step 1) ────────────────────────────────────────────────────
function ShippingForm({
  onNext,
  defaultValues,
}: {
  onNext: (data: ShippingData) => void
  defaultValues?: Partial<ShippingData>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>({ resolver: zodResolver(shippingSchema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={20} className="text-indigo-500" />
          Shipping Address
        </h2>
        <p className="text-sm text-gray-500 mt-1">Where should we deliver your order?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
          placeholder="John"
        />
        <Input
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
          placeholder="Doe"
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="john@example.com"
      />

      <Input
        label="Phone Number"
        {...register('phone')}
        error={errors.phone?.message}
        placeholder="+1 (555) 000-0000"
        optional
      />

      <Input
        label="Street Address"
        {...register('street')}
        error={errors.street?.message}
        placeholder="123 Main Street"
      />

      <Input
        label="Apartment / Suite"
        {...register('apt')}
        error={errors.apt?.message}
        placeholder="Apt 4B"
        optional
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          {...register('city')}
          error={errors.city?.message}
          placeholder="New York"
        />
        <Input
          label="State"
          {...register('state')}
          error={errors.state?.message}
          placeholder="NY"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ZIP Code"
          {...register('zipCode')}
          error={errors.zipCode?.message}
          placeholder="10001"
        />
        <Input
          label="Country"
          {...register('country')}
          error={errors.country?.message}
          placeholder="United States"
        />
      </div>

      <Button type="submit" size="lg" fullWidth rightIcon={<ChevronRight size={18} />}>
        Continue to Payment
      </Button>
    </form>
  )
}

// ── Payment form (step 2) ─────────────────────────────────────────────────────
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentData>({ resolver: zodResolver(paymentSchema), defaultValues })

  const cardNumber = watch('cardNumber', '')
  const expiry     = watch('expiry', '')

  const cardSegments = cardNumber ? cardNumber.split(' ') : []

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CreditCard size={20} className="text-indigo-500" />
          Payment Details
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Your payment information is encrypted and secure.
        </p>
      </div>

      {/* Card preview */}
      <div className="h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 px-5 flex items-center justify-between shadow-lg shadow-indigo-200">
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="text-white/80 font-mono text-sm tracking-widest">
              {cardSegments[i] || '····'}
            </span>
          ))}
        </div>
        <CreditCard size={22} className="text-white/60" />
      </div>

      {/* Card number */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Card Number</label>
        <input
          className={[
            'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900',
            'placeholder:text-gray-400 bg-white shadow-sm font-mono tracking-widest',
            'outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0',
            errors.cardNumber
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100',
          ].join(' ')}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setValue('cardNumber', fmtCard(e.target.value), { shouldValidate: true })}
          inputMode="numeric"
        />
        {errors.cardNumber && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
            </svg>
            {errors.cardNumber.message}
          </p>
        )}
      </div>

      <Input
        label="Name on Card"
        {...register('nameOnCard')}
        error={errors.nameOnCard?.message}
        placeholder="John Doe"
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Expiry */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Expiry Date</label>
          <input
            className={[
              'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900',
              'placeholder:text-gray-400 bg-white shadow-sm font-mono tracking-widest',
              'outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0',
              errors.expiry
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100',
            ].join(' ')}
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setValue('expiry', fmtExpiry(e.target.value), { shouldValidate: true })}
            inputMode="numeric"
          />
          {errors.expiry && (
            <p className="text-xs text-red-600">{errors.expiry.message}</p>
          )}
        </div>

        {/* CVV */}
        <Input
          label="CVV"
          type={showCvv ? 'text' : 'password'}
          {...register('cvv')}
          error={errors.cvv?.message}
          placeholder="•••"
          inputMode="numeric"
          maxLength={4}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowCvv((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showCvv ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Lock size={12} />
        This is a demo checkout — no real payment is processed.
      </p>

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="lg"
          leftIcon={<ArrowLeft size={18} />}
          onClick={onBack}
        >
          Back
        </Button>
        <Button type="submit" size="lg" fullWidth rightIcon={<ChevronRight size={18} />}>
          Review Order
        </Button>
      </div>
    </form>
  )
}

// ── Review step (step 3) ──────────────────────────────────────────────────────
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
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck size={20} className="text-indigo-500" />
          Review Your Order
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Please confirm your details before placing the order.
        </p>
      </div>

      {/* Shipping address */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2.5">
          <MapPin size={14} className="text-indigo-500" /> Deliver To
        </p>
        <p className="text-sm font-medium text-gray-900">
          {shippingData.firstName} {shippingData.lastName}
        </p>
        <p className="text-sm text-gray-600">
          {shippingData.street}
          {shippingData.apt ? `, ${shippingData.apt}` : ''}
        </p>
        <p className="text-sm text-gray-600">
          {shippingData.city}, {shippingData.state} {shippingData.zipCode}
        </p>
        <p className="text-sm text-gray-600">{shippingData.country}</p>
        <p className="text-sm text-gray-500 pt-1">
          {shippingData.email}
          {shippingData.phone ? ` · ${shippingData.phone}` : ''}
        </p>
      </div>

      {/* Payment */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2.5">
          <CreditCard size={14} className="text-indigo-500" /> Payment Method
        </p>
        <p className="text-sm font-mono text-gray-900">{maskedCard}</p>
        <p className="text-sm text-gray-600">{paymentData.nameOnCard}</p>
        <p className="text-xs text-gray-400 mt-1">Expires {paymentData.expiry}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="lg"
          leftIcon={<ArrowLeft size={18} />}
          onClick={onBack}
          disabled={isPlacing}
        >
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          fullWidth
          loading={isPlacing}
          leftIcon={!isPlacing ? <Lock size={16} /> : undefined}
          onClick={onPlaceOrder}
        >
          {isPlacing ? 'Placing Order…' : 'Place Order'}
        </Button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate    = useNavigate()
  const { items, isEmpty, clearCart } = useCart()
  const checkout = useCheckout()

  const [step,         setStep]         = useState<Step>('shipping')
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [paymentData,  setPaymentData]  = useState<PaymentData  | null>(null)
  const [orderError,   setOrderError]   = useState<string>('')

  if (isEmpty) return <Navigate to={ROUTES.CUSTOMER.CART} replace />

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleShippingNext(data: ShippingData) {
    setShippingData(data)
    setStep('payment')
    scrollTop()
  }

  function handlePaymentNext(data: PaymentData) {
    setPaymentData(data)
    setStep('review')
    scrollTop()
  }

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
        err?.response?.data?.message ||
          'Something went wrong placing your order. Please try again.',
      )
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={ROUTES.CUSTOMER.CART}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.reduce((s, i) => s + i.quantity, 0)} items
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Step content ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
          <StepIndicator current={step} />

          {step === 'shipping' && (
            <ShippingForm
              onNext={handleShippingNext}
              defaultValues={shippingData ?? undefined}
            />
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

        {/* ── Sticky summary ─────────────────────────────────────────── */}
        <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-24 shrink-0">
          <CheckoutSummary items={items} />
        </div>
      </div>
    </div>
  )
}
