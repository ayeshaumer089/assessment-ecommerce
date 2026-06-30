import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { getErrorMessage } from '@/utils/errorHandler'

const schema = z
  .object({
    firstName: z.string().min(2, 'At least 2 characters'),
    lastName:  z.string().min(2, 'At least 2 characters'),
    email:     z.string().email('Enter a valid email'),
    username:  z.string().min(3, 'At least 3 characters').max(20).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers and _ only'),
    password:  z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'One uppercase required').regex(/[0-9]/, 'One number required'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, { message: 'You must accept the terms' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

const STRENGTH_CHECKS = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase',     test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number',        test: (p: string) => /[0-9]/.test(p) },
  { label: 'Symbol',        test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
]
const BAR_CLASS = ['', 'weak', 'fair', 'good', 'strong']

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const passed = STRENGTH_CHECKS.filter((c) => c.test(password)).length
  return (
    <div className="sz-auth-strength">
      <div className="bars">
        {STRENGTH_CHECKS.map((_, i) => (
          <div key={i} className={`bar${i < passed ? ` ${BAR_CLASS[passed]}` : ''}`} />
        ))}
      </div>
      <div className="checks">
        {STRENGTH_CHECKS.map((c) => {
          const ok = c.test(password)
          return (
            <span key={c.label} className={`chk${ok ? ' ok' : ''}`}>
              {ok ? <CheckCircle2 size={11} /> : <Circle size={11} />} {c.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [serverError,  setServerError]  = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const passwordValue = watch('password', '')

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await signup({
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        username:  data.username,
        password:  data.password,
      })
      navigate(ROUTES.CUSTOMER.PRODUCTS, { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <div className="sz-auth-screen">
      {/* Left branding */}
      <div className="sz-auth-left">
        <div className="sz-auth-brand">
          <span className="mark">S</span>ShopZone
        </div>

        <div className="sz-auth-mid">
          <h1>Join millions of<br />happy shoppers.</h1>
          <p>Create your free account today and unlock exclusive deals, fast checkout, and personalised recommendations.</p>

          <div className="sz-auth-perk-list">
            <div className="perk"><span className="ic">★</span> Member-exclusive deals every week</div>
            <div className="perk"><span className="ic">🚚</span> Free shipping on orders over $50</div>
            <div className="perk"><span className="ic">↺</span> Easy 30-day free returns</div>
          </div>
        </div>

        <div className="sz-auth-stats">
          <div className="stat-chip"><div className="num">2M+</div><div className="lbl">Customers</div></div>
          <div className="stat-chip"><div className="num">50K+</div><div className="lbl">Products</div></div>
          <div className="stat-chip"><div className="num">4.9★</div><div className="lbl">Rating</div></div>
        </div>
      </div>

      {/* Right form */}
      <div className="sz-auth-right">
        <div className="sz-auth-form-wrap">
          <h1>Create your account</h1>
          <div className="sub">It&apos;s free and takes less than a minute</div>

          <div className="sz-auth-demo-note">
            <b>Demo mode:</b> New accounts are created via DummyJSON and you&apos;ll be logged in immediately. Credentials won&apos;t persist for future logins.
          </div>

          {serverError && <div className="sz-auth-err">{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="sz-auth-field-row">
              <div className="sz-auth-field">
                <label>First name</label>
                <input type="text" placeholder="Emily" autoComplete="given-name" autoFocus {...register('firstName')} />
                {errors.firstName && <span className="err">{errors.firstName.message}</span>}
              </div>
              <div className="sz-auth-field">
                <label>Last name</label>
                <input type="text" placeholder="Johnson" autoComplete="family-name" {...register('lastName')} />
                {errors.lastName && <span className="err">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="sz-auth-field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
              {errors.email && <span className="err">{errors.email.message}</span>}
            </div>

            <div className="sz-auth-field">
              <label>Username</label>
              <input type="text" placeholder="e.g. emily_j" autoComplete="username" {...register('username')} />
              <span className="hint">Lowercase letters, numbers and underscores only</span>
              {errors.username && <span className="err">{errors.username.message}</span>}
            </div>

            <div className="sz-auth-field">
              <label>Password</label>
              <div className="sz-auth-pwd-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, uppercase & number"
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button type="button" className="eye" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="err">{errors.password.message}</span>}
              <PasswordStrength password={passwordValue} />
            </div>

            <div className="sz-auth-field">
              <label>Confirm password</label>
              <div className="sz-auth-pwd-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button type="button" className="eye" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="err">{errors.confirmPassword.message}</span>}
            </div>

            <label className="sz-auth-agree">
              <input type="checkbox" {...register('terms')} />
              <span>
                I agree to the{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: '#5B3DF6', fontWeight: 600, cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: '#5B3DF6', fontWeight: 600, cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.terms && <div className="sz-auth-err" style={{ marginTop: 0, marginBottom: 12 }}>{errors.terms.message}</div>}

            <button type="submit" className="sz-auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <div className="sz-auth-bottom">
            Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
