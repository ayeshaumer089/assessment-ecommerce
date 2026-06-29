import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { authService } from '@/services/authService'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    authService.getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    const { user: authUser, token: authToken } = res.data.data
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(authUser)
  }

  const logout = () => {
    authService.logout().catch(() => {})
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
