import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services/orderService'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useAuth } from '@/context/AuthContext'
import type { CreateOrderPayload } from '@/types'

export function useOrders() {
  const { user } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.ORDERS(user?.id),
    queryFn: () => orderService.getOrders(user?.id),
    enabled: !!user,
  })
}

export function useAllOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS(),
    queryFn: () => orderService.getOrders(),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => {
      if (!user) throw new Error('Must be logged in to place an order')
      return orderService.createOrder(user.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS(user?.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS() })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof orderService.updateOrderStatus>[1] }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(order.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS() })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => orderService.cancelOrder(id),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(order.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS() })
    },
  })
}
