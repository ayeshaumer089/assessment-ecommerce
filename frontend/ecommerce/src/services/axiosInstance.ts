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
  (res) => {
    // Unwrap the backend's { success, data, meta } envelope.
    // Preserve meta by merging it into data when data is an array.
    if (
      res.data &&
      typeof res.data === 'object' &&
      'success' in res.data &&
      'data' in res.data
    ) {
      const { data, meta, ...rest } = res.data
      if (meta !== undefined) {
        // Keep meta accessible: return { data: [...], meta: {...} }
        res.data = { data, meta, ...rest }
      } else {
        res.data = data
      }
    }
    return res
  },
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
