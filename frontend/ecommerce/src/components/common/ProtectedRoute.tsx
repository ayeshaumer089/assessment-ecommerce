import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import PageLoader from './PageLoader'

interface Props {
  requiredRole?: 'admin' | 'customer'
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
