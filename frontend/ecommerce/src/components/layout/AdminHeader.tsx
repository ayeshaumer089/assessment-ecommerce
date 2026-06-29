import { useState } from 'react'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Props {
  title?: string
}

export default function AdminHeader({ title }: Props) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 gap-4">
      {/* Left: page title */}
      <h1 className="text-base font-semibold text-gray-800 truncate">{title ?? 'Admin Panel'}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
          <Search size={14} />
          <span>Search…</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs uppercase">
              {user?.name?.[0] ?? 'A'}
            </span>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
