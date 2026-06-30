import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'
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
  const [showPassword, setShowPassword] = useState(false)
  const [serverError,  setServerError]  = useState('')

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
    <div style={{
      margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      background: 'radial-gradient(800px 400px at 20% -10%, #1d1450 0%, transparent 60%), radial-gradient(700px 500px at 100% 10%, #0e2150 0%, transparent 55%), #0a0e1a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: '#eef0fa',
    }}>
      <div className="sz-alog-wrap" style={{ width: '100%', maxWidth: '400px' }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(145deg, #7a6ffb, #4338d6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px -8px rgba(91,79,245,.55)', marginBottom: '16px',
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            {ENV.APP_NAME} Admin
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#8891ac' }}>
            Restricted access — authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(180deg, #141b2e, #10172a)',
          border: '1px solid #232c45', borderRadius: '18px',
          padding: '24px', boxShadow: '0 20px 50px -20px rgba(0,0,0,.6)',
        }}>

          {/* Server error */}
          {serverError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,104,104,.08)', border: '1px solid rgba(255,104,104,.35)',
              color: '#ff9a9a', fontSize: '12.5px', padding: '10px 12px',
              borderRadius: '10px', marginBottom: '16px',
            }}>
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#c7cbe0', marginBottom: '7px', letterSpacing: '.01em' }}>
                Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '13px', color: '#5f6889', pointerEvents: 'none' }} />
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@example.com"
                  {...register('email')}
                  className={`sz-alog-input${errors.email ? ' err' : ''}`}
                />
              </div>
              {errors.email && (
                <p style={{ color: '#ff9a9a', fontSize: '12px', margin: '5px 0 0' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#c7cbe0', marginBottom: '7px', letterSpacing: '.01em' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '13px', color: '#5f6889', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`sz-alog-input sz-alog-pwd${errors.password ? ' err' : ''}`}
                />
                <button type="button" className="sz-alog-eye" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ff9a9a', fontSize: '12px', margin: '5px 0 0' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-6px 0 16px' }}>
              <button type="button" style={{ fontSize: '12.5px', color: '#7a6ffb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="sz-alog-submit">
              {!isSubmitting && <ShieldCheck size={16} />}
              {isSubmitting ? 'Signing in…' : 'Sign in to Admin'}
            </button>
          </form>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid #232c45', margin: '22px 0 16px' }} />

          {/* Demo credentials */}
          <div style={{ background: '#0c1120', border: '1px solid #232c45', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', color: '#5f6889', marginBottom: '10px' }}>
              DEMO CREDENTIALS
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', padding: '4px 0' }}>
              <span style={{ color: '#8891ac' }}>Email:</span>
              <span style={{ color: '#cfd3ec', fontFamily: 'ui-monospace, monospace' }}>{DEMO.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', padding: '4px 0' }}>
              <span style={{ color: '#8891ac' }}>Password:</span>
              <span style={{ color: '#cfd3ec', fontFamily: 'ui-monospace, monospace' }}>{DEMO.password}</span>
            </div>
            <button type="button" onClick={fillDemo} className="sz-alog-autofill">
              Auto-fill demo credentials
            </button>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#8891ac', marginTop: '22px' }}>
          Not an admin?{' '}
          <a href={ROUTES.HOME} style={{ color: '#7a6ffb', textDecoration: 'none', fontWeight: 600 }}>
            Return to store
          </a>
        </p>
      </div>
    </div>
  )
}
