import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import { ROUTES } from '@/constants/routes'
import CustomerLayout from '@/components/layout/CustomerLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const ProductsPage = lazy(() => import('@/pages/customer/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/customer/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/customer/CheckoutPage'))
const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage'))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/ProductsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/CustomersPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'))

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.CUSTOMER.PRODUCTS, element: <ProductsPage /> },
      { path: ROUTES.CUSTOMER.PRODUCT_DETAIL, element: <ProductDetailPage /> },
      {
        element: <ProtectedRoute requiredRole="customer" />,
        children: [
          { path: ROUTES.CUSTOMER.CART, element: <CartPage /> },
          { path: ROUTES.CUSTOMER.CHECKOUT, element: <CheckoutPage /> },
          { path: ROUTES.CUSTOMER.ORDERS, element: <OrdersPage /> },
          { path: ROUTES.CUSTOMER.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        path: ROUTES.ADMIN.DASHBOARD,
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: ROUTES.ADMIN.PRODUCTS, element: <AdminProductsPage /> },
          { path: ROUTES.ADMIN.ORDERS, element: <AdminOrdersPage /> },
          { path: ROUTES.ADMIN.CUSTOMERS, element: <AdminCustomersPage /> },
          { path: ROUTES.ADMIN.ANALYTICS, element: <AdminAnalyticsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
