import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { authService, type LoginCredentials, type SignupPayload } from '@/services/authService'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser())
  const [token, setToken] = useState<string | null>(() => authService.getStoredToken())
  const [isLoading, setIsLoading] = useState(!!authService.getStoredToken())

  // Re-validate token on mount if one exists
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .getMe()
      .then((freshUser) => setUser(freshUser))
      .catch(() => {
        authService.logout()
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only on mount

  // Listen for 401 events from axios interceptor
  useEffect(() => {
    const handler = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const { user: authUser, token: authToken } = await authService.login(credentials)
    setToken(authToken)
    setUser(authUser)
  }

  const signup = async (payload: SignupPayload) => {
    const { user: authUser, token: authToken } = await authService.signup(payload)
    setToken(authToken)
    setUser(authUser)
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
