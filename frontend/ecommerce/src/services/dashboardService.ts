import api from './axiosInstance'
import type { DashboardStats } from '@/types'

export const dashboardService = {
  async getStats(period?: string): Promise<DashboardStats> {
    const params = period ? { period } : {}
    const { data } = await api.get<DashboardStats>('/dashboard/stats', { params })
    return data
  },
}
