import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle2, Circle, Star, Package, Truck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { getErrorMessage } from '@/utils/errorHandler'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Validation schema ────────────────────────────────────────────────────────
const schema = z
  .object({
    firstName: z.string().min(2, 'At least 2 characters'),
    lastName: z.string().min(2, 'At least 2 characters'),
    email: z.string().email('Enter a valid email'),
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .max(20, 'Max 20 characters')
      .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and _'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter required')
      .regex(/[0-9]/, 'One number required'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

// ── Password strength helper ─────────────────────────────────────────────────
const STRENGTH_CHECKS = [
  { label: '8+ characters',   test: (p: string) => p.length >= 8          },
  { label: 'Uppercase',       test: (p: string) => /[A-Z]/.test(p)        },
  { label: 'Number',          test: (p: string) => /[0-9]/.test(p)        },
  { label: 'Symbol',          test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
]

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR  = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500']

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const passed = STRENGTH_CHECKS.filter((c) => c.test(password)).length
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {STRENGTH_CHECKS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < passed ? STRENGTH_COLOR[passed] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {STRENGTH_CHECKS.map((c) => {
            const ok = c.test(password)
            return (
              <span
                key={c.label}
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  ok ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {ok ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                {c.label}
              </span>
            )
          })}
        </div>
        {passed > 0 && (
          <span
            className={`text-[11px] font-semibold ${
              passed <= 1
                ? 'text-red-500'
                : passed === 2
                  ? 'text-amber-500'
                  : passed === 3
                    ? 'text-blue-500'
                    : 'text-emerald-600'
            }`}
          >
            {STRENGTH_LABEL[passed]}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Perks for left panel ─────────────────────────────────────────────────────
const PERKS = [
  { icon: Star,    label: 'Member-exclusive deals every week'    },
  { icon: Truck,   label: 'Free shipping on orders over $50'     },
  { icon: Package, label: 'Easy 30-day free returns'             },
]

// ── Component ────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')

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
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: data.password,
      })
      navigate(ROUTES.CUSTOMER.PRODUCTS, { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] bg-gradient-to-br from-violet-950 via-indigo-900 to-indigo-800 relative overflow-hidden flex-col justify-between p-12 shrink-0">
        <span className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 backdrop-blur rounded-xl border border-white/25 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ShopZone</span>
        </div>

        {/* Content */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] tracking-tight">
              Join millions of<br />happy shoppers.
            </h1>
            <p className="mt-4 text-indigo-200/80 text-sm leading-relaxed max-w-xs">
              Create your free account today and unlock exclusive deals, fast checkout, and personalised recommendations.
            </p>
          </div>

          <ul className="space-y-3.5">
            {PERKS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-indigo-300" />
                </span>
                <span className="text-indigo-100 text-sm">{label}</span>
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[['2M+', 'Customers'], ['50K+', 'Products'], ['4.9★', 'Rating']].map(
              ([value, label]) => (
                <div
                  key={label}
                  className="bg-white/8 border border-white/10 rounded-xl p-3 text-center"
                >
                  <p className="text-white font-bold text-lg leading-none">{value}</p>
                  <p className="text-indigo-300 text-[11px] mt-1">{label}</p>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Note */}
        <p className="relative text-indigo-400/60 text-[11px]">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-indigo-300 hover:text-white font-medium">
            Sign in here
          </Link>
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 lg:px-16 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8 pt-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900">ShopZone</span>
        </div>

        <div className="w-full max-w-[440px] py-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-1 text-sm text-gray-500">It&apos;s free and takes less than a minute</p>
          </div>

          {/* Demo note */}
          <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Demo mode:</span> New accounts are created via DummyJSON and you&apos;ll be logged in immediately. Credentials won&apos;t persist for future logins.
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="Emily"
                autoComplete="given-name"
                autoFocus
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Johnson"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Username"
              placeholder="e.g. emily_j"
              autoComplete="username"
              hint="Lowercase letters, numbers and underscores only"
              error={errors.username?.message}
              {...register('username')}
            />

            {/* Password with strength meter */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase & number"
                autoComplete="new-password"
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
              <PasswordStrength password={passwordValue} />
            </div>

            <Input
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('confirmPassword')}
            />

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer shrink-0"
                  {...register('terms')}
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <button type="button" className="text-indigo-600 hover:underline font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-indigo-600 hover:underline font-medium">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                  </svg>
                  {errors.terms.message}
                </p>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-1">
              {isSubmitting ? 'Creating account…' : 'Create free account'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
