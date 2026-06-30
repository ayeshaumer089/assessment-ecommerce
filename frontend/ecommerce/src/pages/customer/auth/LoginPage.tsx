import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { getErrorMessage } from '@/utils/errorHandler'
import { authService } from '@/services/authService'

const schema = z.object({
  email: z.string().email('Enter a valid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    ROUTES.CUSTOMER.PRODUCTS

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await login(data)
      // authService.login() writes the user to localStorage before resolving,
      // so we can read the role synchronously right after the await.
      const storedUser = authService.getStoredUser()
      if (storedUser?.role === 'admin') {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const fillDemo = () => {
    setValue('email', 'customer@example.com')
    setValue('password', 'Customer123!')
  }

  return (
    <div className="sz-auth-screen">
      {/* Left branding */}
      <div className="sz-auth-left">
        <div className="sz-auth-brand">
          <span className="mark">S</span>ShopZone
        </div>

        <div className="sz-auth-mid">
          <h1>
            Your favourite<br />brands,<br />
            <span className="accent">all in one place.</span>
          </h1>
          <p>Thousands of products, unbeatable prices, and same-day shipping — right at your fingertips.</p>

          <div className="sz-auth-perk-list">
            <div className="perk"><span className="ic">⚡</span> Lightning-fast checkout</div>
            <div className="perk"><span className="ic">🛡️</span> 100% secure payments</div>
            <div className="perk"><span className="ic">★</span> Exclusive member deals</div>
            <div className="perk"><span className="ic">↺</span> Free returns on every order</div>
          </div>
        </div>

        <div className="sz-auth-testimonial">
          <div className="stars">★★★★★</div>
          <p>"ShopZone completely changed how I shop. The deals are unreal and delivery is always on time!"</p>
          <div className="who">
            <div className="avatar">
              <img src="https://dummyjson.com/icon/emilys/48" alt="Emily" />
            </div>
            <div>
              <div className="name">Emily Johnson</div>
              <div className="sub">Verified Customer · 142 orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="sz-auth-right">
        <div className="sz-auth-form-wrap">
          <h1>Welcome back</h1>
          <div className="sub">Sign in to continue shopping</div>

          {/* Demo box */}
          <div className="sz-auth-demo">
            <div className="txt">
              <b>Demo credentials</b><br />customer@example.com / Customer123!
            </div>
            <button type="button" className="auto" onClick={fillDemo}>
              Auto-fill <ArrowRight size={12} />
            </button>
          </div>

          {serverError && <div className="sz-auth-err">{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="sz-auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="e.g. customer@example.com"
                autoComplete="email"
                autoFocus
                {...register('email')}
              />
              {errors.email && <span className="err">{errors.email.message}</span>}
            </div>

            <div className="sz-auth-field">
              <label>Password</label>
              <div className="sz-auth-pwd-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button type="button" className="eye" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="err">{errors.password.message}</span>}
            </div>

            <div className="sz-auth-row-between">
              <label className="sz-auth-remember">
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="sz-auth-forgot">Forgot password?</button>
            </div>

            <button type="submit" className="sz-auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="sz-auth-divider">or</div>

          <div className="sz-auth-oauth">
            <button type="button" disabled>Google</button>
            <button type="button" disabled>Apple</button>
          </div>

          <div className="sz-auth-bottom">
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER}>Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
