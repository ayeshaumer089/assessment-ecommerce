import api from './axiosInstance'
import type { User } from '@/types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface SignupPayload {
  name?: string
  firstName?: string
  lastName?: string
  email: string
  username?: string
  password: string
}

interface AuthResponse {
  user: User
  accessToken: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const loginData = credentials.email 
      ? { email: credentials.email, password: credentials.password }
      : { email: credentials.username, password: credentials.password }
    const { data } = await api.post<AuthResponse>('/auth/login', loginData)
    const user = { ...data.user, id: data.user._id || data.user.id }
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { user, token: data.accessToken }
  },

  async signup(payload: SignupPayload): Promise<{ user: User; token: string }> {
    const name = payload.name || `${payload.firstName} ${payload.lastName}`
    const signupData = { name, email: payload.email, password: payload.password }
    const { data } = await api.post<AuthResponse>('/auth/signup', signupData)
    const user = { ...data.user, id: data.user._id || data.user.id }
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { user, token: data.accessToken }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    const user = { ...data, id: data._id || data.id }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    authService.clearStorage()
  },

  clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
}
