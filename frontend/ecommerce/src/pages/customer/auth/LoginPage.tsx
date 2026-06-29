import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, ArrowRight, Zap, Shield, Star, ShoppingBag,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { getErrorMessage } from '@/utils/errorHandler'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

const FEATURES = [
  { icon: Zap,      label: 'Lightning-fast checkout' },
  { icon: Shield,   label: '100% secure payments'   },
  { icon: Star,     label: 'Exclusive member deals'  },
  { icon: ShoppingBag, label: 'Free returns on every order' },
]

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
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const fillDemo = () => {
    setValue('username', 'emilys')
    setValue('password', 'emilyspass')
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 relative overflow-hidden flex-col justify-between p-12 shrink-0">
        {/* Decorative blobs */}
        <span className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <span className="absolute -bottom-24 right-0 w-80 h-80 bg-purple-700/25 rounded-full blur-3xl pointer-events-none" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 backdrop-blur rounded-xl border border-white/25 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ShopZone</span>
        </div>

        {/* Headline + features */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
              Your favourite<br />brands,<br />
              <span className="text-indigo-300">all in one place.</span>
            </h1>
            <p className="mt-4 text-indigo-200/80 text-sm leading-relaxed max-w-xs">
              Thousands of products, unbeatable prices, and same-day shipping — right at your fingertips.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-indigo-300" />
                </span>
                <span className="text-indigo-100 text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial card */}
        <div className="relative">
          <div className="bg-white/8 backdrop-blur border border-white/15 rounded-2xl p-5">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-white/85 text-sm leading-relaxed italic">
              "ShopZone completely changed how I shop. The deals are unreal and delivery is always on time!"
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <img
                src="https://dummyjson.com/icon/emilys/48"
                alt="Emily"
                className="w-8 h-8 rounded-full object-cover border-2 border-white/25"
              />
              <div>
                <p className="text-white text-xs font-semibold">Emily Johnson</p>
                <p className="text-indigo-300 text-[11px]">Verified Customer · 142 orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 lg:px-16 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900">ShopZone</span>
        </div>

        <div className="w-full max-w-[400px] py-10">
          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to continue shopping</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div>
              <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Demo credentials</p>
              <p className="text-xs text-amber-600 font-mono">
                emilys&nbsp;/&nbsp;emilyspass
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Auto-fill <ArrowRight size={11} />
            </button>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Username"
              placeholder="e.g. emilys"
              autoComplete="username"
              autoFocus
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <span className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Social placeholders */}
          <div className="grid grid-cols-2 gap-3">
            {['Google', 'Apple'].map((p) => (
              <button
                key={p}
                type="button"
                disabled
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
