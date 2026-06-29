import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/constants/env'

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err: AxiosError) => Promise.reject(err),
)

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  },
)

export default api
