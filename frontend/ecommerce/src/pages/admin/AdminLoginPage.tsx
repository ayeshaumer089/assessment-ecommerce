import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'
import Button from '@/components/ui/Button'
import PageLoader from '@/components/common/PageLoader'

const schema = z.object({
  email: z.string().email('Enter a valid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

const DEMO = { email: 'admin@example.com', password: 'Admin123!' }

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, user, isAuthenticated, isLoading } = useAuth()
  const [showPassword, setShowPassword]   = useState(false)
  const [serverError,  setServerError]    = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (isLoading) return <PageLoader />

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      await login(values)
      // Check role after login resolves — AuthContext updates user synchronously
      // We navigate and let ProtectedRoute handle non-admin users
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
    } catch {
      setServerError('Invalid credentials. Please try again.')
    }
  }

  const fillDemo = () => {
    setValue('email', DEMO.email)
    setValue('password', DEMO.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-900/60">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {ENV.APP_NAME} Admin
          </h1>
          <p className="text-slate-400 text-sm mt-1">Restricted access — authorized personnel only</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Server error */}
            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@example.com"
                  {...register('email')}
                  className={[
                    'block w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-sm text-white',
                    'bg-slate-700 placeholder:text-slate-500',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-800',
                    errors.email
                      ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20',
                  ].join(' ')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={[
                    'block w-full rounded-xl border pl-9 pr-10 py-2.5 text-sm text-white',
                    'bg-slate-700 placeholder:text-slate-500',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-800',
                    errors.password
                      ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              leftIcon={!isSubmitting ? <ShieldCheck size={17} /> : undefined}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in to Admin'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300 mb-3">
              <span className="text-slate-500">Email:</span>
              <span className="font-mono">{DEMO.email}</span>
              <span className="text-slate-500">Password:</span>
              <span className="font-mono">{DEMO.password}</span>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors"
            >
              Auto-fill demo credentials
            </button>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-sm text-slate-500">
          Not an admin?{' '}
          <a href={ROUTES.HOME} className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Return to store
          </a>
        </p>
      </div>
    </div>
  )
}
