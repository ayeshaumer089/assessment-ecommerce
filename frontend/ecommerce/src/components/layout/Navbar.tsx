import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'

const NAV_LINKS = [
  { label: 'Products', to: ROUTES.CUSTOMER.PRODUCTS },
  { label: 'Orders', to: ROUTES.CUSTOMER.ORDERS },
]

const LOGO_STYLE: React.CSSProperties = {
  width: '34px', height: '34px', borderRadius: '9px',
  background: 'linear-gradient(145deg, #7a6ffb, #4338d6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontWeight: 700, fontSize: '15px',
  boxShadow: '0 6px 16px -6px rgba(91,79,245,.55)', flexShrink: 0,
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const totalItems = useCartStore((s) => s.totalItems())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [location])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}
        style={{ borderBottom: '1px solid #eef0f5' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '62px' }}>

          {/* Logo */}
          <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={LOGO_STYLE}>S</div>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#1a1d2b', letterSpacing: '-0.01em' }}>{ENV.APP_NAME}</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '32px' }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sz-nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

            {/* Cart */}
            <Link to={ROUTES.CUSTOMER.CART} className="sz-nav-cart-btn" aria-label="Cart">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="sz-nav-cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </Link>

            {/* User menu (desktop) */}
            {isAuthenticated ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px 6px 6px', borderRadius: '10px', border: '1px solid #eef0f5', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s ease' }}
                >
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #7a6ffb, #4338d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1d2b', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name}
                  </span>
                  <ChevronDown size={14} style={{ color: '#5b6072', transition: 'transform .2s ease', transform: userMenuOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
                </button>

                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, marginTop: '6px', width: '200px', background: '#fff', borderRadius: '14px', boxShadow: '0 8px 30px -8px rgba(26,17,64,.2)', border: '1px solid #eef0f5', padding: '6px', zIndex: 50 }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #eef0f5', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#8891ac' }}>Signed in as</p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: '#1a1d2b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    </div>
                    {[
                      { to: ROUTES.CUSTOMER.PROFILE, label: 'Profile', icon: <User size={14} /> },
                      { to: ROUTES.CUSTOMER.ORDERS, label: 'Orders', icon: null },
                    ].map(({ to, label, icon }) => (
                      <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '13.5px', color: '#1a1d2b', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f7fb')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        {icon}{label}
                      </Link>
                    ))}
                    {user?.role === 'admin' && (
                      <Link to={ROUTES.ADMIN.DASHBOARD} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '13.5px', color: '#5b4ff5', fontWeight: 600, textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f1ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div style={{ borderTop: '1px solid #eef0f5', marginTop: '4px', paddingTop: '4px' }}>
                      <button
                        onClick={logout}
                        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '13.5px', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex" style={{ alignItems: 'center', gap: '18px' }}>
                <Link to={ROUTES.LOGIN} className="sz-nav-signin">Sign in</Link>
                <Link to={ROUTES.REGISTER} className="sz-nav-signup">Sign up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: '#1a1d2b' }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Accent bar */}
        <div className="sz-accent-bar" />
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full md:hidden"
        style={{ width: '280px', background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .3s ease-in-out' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '62px', borderBottom: '1px solid #eef0f5' }}>
          <span style={{ fontWeight: 700, color: '#1a1d2b' }}>{ENV.APP_NAME}</span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', color: '#5b6072' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', height: 'calc(100% - 62px)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                color: isActive ? '#5b4ff5' : '#1a1d2b',
                background: isActive ? '#f3f1ff' : '',
                textDecoration: 'none', display: 'block',
              })}
            >
              {link.label}
            </NavLink>
          ))}

          <div style={{ borderTop: '1px solid #eef0f5', margin: '8px 0' }} />

          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f6f7fb', borderRadius: '12px', marginBottom: '4px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7a6ffb, #4338d6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1a1d2b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8891ac', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                </div>
              </div>
              <Link to={ROUTES.CUSTOMER.PROFILE} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', color: '#1a1d2b', textDecoration: 'none' }}>
                <User size={15} /> Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to={ROUTES.ADMIN.DASHBOARD} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px', color: '#5b4ff5', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                style={{ marginTop: 'auto', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', color: '#e53e3e', fontWeight: 600, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <Link to={ROUTES.LOGIN} style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#1a1d2b', border: '1px solid #eef0f5', borderRadius: '12px', textDecoration: 'none' }}>
                Sign in
              </Link>
              <Link to={ROUTES.REGISTER} className="sz-nav-signup" style={{ textAlign: 'center', display: 'block', padding: '12px' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
