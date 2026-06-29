import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function parseApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<ApiError>
  if (axiosError.response) {
    return {
      message: axiosError.response.data?.message ?? 'An error occurred',
      status: axiosError.response.status,
      errors: axiosError.response.data?.errors,
    }
  }
  if (axiosError.request) {
    return { message: 'Network error. Please check your connection.', status: 0 }
  }
  return { message: 'An unexpected error occurred.', status: 0 }
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message
}
