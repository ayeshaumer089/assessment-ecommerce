import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'

export default function CustomerLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { isAuthenticated } = useAuth()
  const fetchCart = useCartStore((s) => s.fetchCart)

  // Load the persisted server cart on login so returning users see their cart;
  // reset local cart state when logged out.
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      useCartStore.setState({ cart: null, items: [] })
    }
  }, [isAuthenticated, fetchCart])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {isHome ? (
          <Outlet />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
