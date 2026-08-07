import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'
import { ROUTES } from '@/constants'
import { PageLoader } from '@/common/components'

interface Props {
  requiredRole?: 'admin' | 'customer'
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    const loginPath = requiredRole === 'admin' ? ROUTES.ADMIN.LOGIN : ROUTES.LOGIN
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
