import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ENV } from '@/constants/env'

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', to: ROUTES.CUSTOMER.PRODUCTS },
    { label: 'My Orders', to: ROUTES.CUSTOMER.ORDERS },
    { label: 'Cart', to: ROUTES.CUSTOMER.CART },
  ],
  Account: [
    { label: 'Profile', to: ROUTES.CUSTOMER.PROFILE },
    { label: 'Sign In', to: ROUTES.LOGIN },
    { label: 'Register', to: ROUTES.REGISTER },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Contact', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </span>
              <span className="text-lg font-bold text-white">{ENV.APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Quality products, delivered fast. Your trusted online shopping destination.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {ENV.APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Made with React + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
