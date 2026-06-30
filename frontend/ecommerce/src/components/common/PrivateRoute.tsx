import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import PageLoader from './PageLoader'

/**
 * Wraps customer-only routes. Redirects to /login and preserves the
 * intended destination so the user lands there after signing in.
 */
export default function PrivateRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    )
  }

  if (user?.role === 'admin') {
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
  }

  return <Outlet />
}
