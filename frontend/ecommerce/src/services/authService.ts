import axiosInstance from './axiosInstance'
import type { ApiResponse, User } from '@/types'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload extends LoginPayload {
  name: string
}

interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  login: (data: LoginPayload) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterPayload) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  logout: () => axiosInstance.post('/auth/logout'),

  getMe: () => axiosInstance.get<ApiResponse<User>>('/auth/me'),
}
