import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import { ROUTES } from '@/constants/routes'
import CustomerLayout from '@/components/layout/CustomerLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import PrivateRoute from '@/components/common/PrivateRoute'

// Auth pages — full screen, no layout wrapper
const LoginPage      = lazy(() => import('@/pages/customer/auth/LoginPage'))
const SignupPage     = lazy(() => import('@/pages/customer/auth/SignupPage'))
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))

// Public pages
const HomePage          = lazy(() => import('@/pages/HomePage'))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))
const ProductsPage      = lazy(() => import('@/pages/customer/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'))

// Protected customer pages
const CartPage          = lazy(() => import('@/pages/customer/CartPage'))
const CheckoutPage      = lazy(() => import('@/pages/customer/CheckoutPage'))
const OrderSuccessPage  = lazy(() => import('@/pages/customer/OrderSuccessPage'))
const OrdersPage        = lazy(() => import('@/pages/customer/OrdersPage'))
const ProfilePage       = lazy(() => import('@/pages/customer/ProfilePage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminProductsPage  = lazy(() => import('@/pages/admin/ProductsPage'))
const AdminOrdersPage    = lazy(() => import('@/pages/admin/OrdersPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/CustomersPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'))

export const router = createBrowserRouter([
  // ── Full-screen auth pages (no navbar / footer) ─────────────────
  { path: ROUTES.LOGIN,        element: <LoginPage />      },
  { path: ROUTES.REGISTER,     element: <SignupPage />     },
  { path: ROUTES.ADMIN.LOGIN,  element: <AdminLoginPage /> },

  // ── Customer-facing layout ──────────────────────────────────────
  {
    path: ROUTES.HOME,
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // Public product browsing
      { path: ROUTES.CUSTOMER.PRODUCTS,       element: <ProductsPage />      },
      { path: ROUTES.CUSTOMER.PRODUCT_DETAIL, element: <ProductDetailPage /> },

      // Requires login (any authenticated customer)
      {
        element: <PrivateRoute />,
        children: [
          { path: ROUTES.CUSTOMER.CART,             element: <CartPage />          },
          { path: ROUTES.CUSTOMER.CHECKOUT,         element: <CheckoutPage />      },
          { path: ROUTES.CUSTOMER.CHECKOUT_SUCCESS, element: <OrderSuccessPage />  },
          { path: ROUTES.CUSTOMER.ORDERS,           element: <OrdersPage />        },
          { path: ROUTES.CUSTOMER.PROFILE,          element: <ProfilePage />       },
        ],
      },
    ],
  },

  // ── Admin panel (requires admin role) ──────────────────────────
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        path: ROUTES.ADMIN.DASHBOARD,
        element: <AdminLayout />,
        children: [
          { index: true,                         element: <AdminDashboardPage /> },
          { path: ROUTES.ADMIN.PRODUCTS,         element: <AdminProductsPage />  },
          { path: ROUTES.ADMIN.ORDERS,           element: <AdminOrdersPage />    },
          { path: ROUTES.ADMIN.CUSTOMERS,        element: <AdminCustomersPage /> },
          { path: ROUTES.ADMIN.ANALYTICS,        element: <AdminAnalyticsPage /> },
        ],
      },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])
