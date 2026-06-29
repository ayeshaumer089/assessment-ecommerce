import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'

const NAV_LINKS = [
  { label: 'Products', to: ROUTES.CUSTOMER.PRODUCTS },
  { label: 'Orders', to: ROUTES.CUSTOMER.ORDERS },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const totalItems = useCartStore((s) => s.totalItems())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [location])

  // shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 shrink-0"
            >
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </span>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                {ENV.APP_NAME}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search — desktop */}
              <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-100 transition-colors">
                <Search size={14} />
                <span>Search…</span>
                <kbd className="ml-2 text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5">⌘K</kbd>
              </button>

              {/* Cart */}
              <Link
                to={ROUTES.CUSTOMER.CART}
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User menu — desktop */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs uppercase">
                      {user?.name?.[0] ?? 'U'}
                    </span>
                    <span className="max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                      </div>
                      <Link to={ROUTES.CUSTOMER.PROFILE} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        <User size={14} /> Profile
                      </Link>
                      <Link to={ROUTES.CUSTOMER.ORDERS} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50">
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          <span className="font-bold text-gray-900">{ENV.APP_NAME}</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-4rem)] px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="border-t border-gray-100 my-3" />

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 mb-1 bg-gray-50 rounded-xl">
                <span className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold uppercase">
                  {user?.name?.[0] ?? 'U'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Link to={ROUTES.CUSTOMER.PROFILE} className="px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <User size={15} /> Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to={ROUTES.ADMIN.DASHBOARD} className="px-4 py-3 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 font-medium">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="mt-auto px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 text-left font-medium"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to={ROUTES.LOGIN}
                className="px-4 py-3 text-sm font-medium text-center text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-3 text-sm font-medium text-center text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
