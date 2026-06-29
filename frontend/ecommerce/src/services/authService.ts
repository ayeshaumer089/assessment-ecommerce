import api from './axiosInstance'
import type { DJAuthResponse } from '@/types/dummyjson'
import type { User } from '@/types'
import { mapAuthUser } from '@/utils/mappers'

const TOKEN_KEY = 'dj_token'
const USER_KEY = 'dj_user'

export interface LoginCredentials {
  username: string
  password: string
}

export interface SignupPayload {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { data } = await api.post<DJAuthResponse>('/auth/login', {
      ...credentials,
      expiresInMins: 60,
    })
    const user = mapAuthUser(data)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { user, token: data.token }
  },

  // DummyJSON doesn't persist new users — we mock the response client-side
  async signup(payload: SignupPayload): Promise<{ user: User; token: string }> {
    const { data } = await api.post<{ id: number } & SignupPayload>('/users/add', payload)
    const user: User = {
      id: String(data.id),
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      username: payload.username,
      role: 'customer',
      createdAt: new Date().toISOString(),
    }
    const mockToken = `mock-token-${data.id}-${Date.now()}`
    localStorage.setItem(TOKEN_KEY, mockToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { user, token: mockToken }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<DJAuthResponse>('/auth/me')
    return mapAuthUser(data)
  },

  logout(): void {
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
