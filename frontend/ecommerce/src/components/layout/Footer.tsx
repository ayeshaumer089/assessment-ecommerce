import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', to: ROUTES.CUSTOMER.PRODUCTS },
    { label: 'My Orders',    to: ROUTES.CUSTOMER.ORDERS   },
    { label: 'Cart',         to: ROUTES.CUSTOMER.CART      },
  ],
  Account: [
    { label: 'Profile',  to: ROUTES.CUSTOMER.PROFILE },
    { label: 'Sign In',  to: ROUTES.LOGIN            },
    { label: 'Register', to: ROUTES.REGISTER         },
  ],
  Company: [
    { label: 'About',           to: '#' },
    { label: 'Contact',         to: '#' },
    { label: 'Privacy Policy',  to: '#' },
    { label: 'Terms of Service',to: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="sz-footer">
      <div className="sz-footer-grid">

        {/* Brand column */}
        <div className="sz-footer-brand-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div className="sz-footer-logo">S</div>
            <span style={{ fontWeight: 700, fontSize: '17px', color: '#eef0fa' }}>{ENV.APP_NAME}</span>
          </div>
          <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#8891ac', maxWidth: '260px', margin: '0 0 16px' }}>
            Quality products, delivered fast. Your trusted online shopping destination.
          </p>
          <div className="sz-footer-social">
            {/* Twitter */}
            <a href="#" aria-label="Twitter">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.98-2.48 9.1 9.1 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.13A12.84 12.84 0 011.64 2.16a4.52 4.52 0 001.4 6.04 4.48 4.48 0 01-2.05-.57v.06a4.52 4.52 0 003.63 4.43 4.5 4.5 0 01-2.04.08 4.52 4.52 0 004.22 3.14A9.06 9.06 0 010 18.58a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.18 9.18 0 0023 3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9V6.5a1.5 1.5 0 011.5-1.5H17V2h-2.5A4.5 4.5 0 0010 6.5V9H7v3h3v10h4V12h2.8l.7-3H14z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title} className="sz-footer-col">
            <h4 style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '.08em', color: '#cfd3ec', margin: '0 0 16px', textTransform: 'uppercase' }}>
              {title}
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="sz-footer-col-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="sz-footer-bottom">
        <p style={{ margin: 0, fontSize: '12.5px', color: '#5f6889' }}>
          &copy; {new Date().getFullYear()} {ENV.APP_NAME}. All rights reserved.
        </p>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#5f6889' }}>
          Made with <span style={{ color: '#7a6ffb' }}>React + Vite</span>
        </p>
      </div>
    </footer>
  )
}
