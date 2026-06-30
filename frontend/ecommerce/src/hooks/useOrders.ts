import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService, type CheckoutPayload } from '@/services/orderService'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useAuth } from '@/context/AuthContext'
import type { OrderStatus, PaymentStatus } from '@/types'

export function useOrders() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.ORDERS(),
    queryFn: () => orderService.getMyOrders(),
    enabled: isAuthenticated,
  })
}

export function useAllOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_ORDERS,
    queryFn: () => orderService.getAllOrders(),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  })
}

export function useCheckout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      if (!user) throw new Error('Must be logged in to place an order')
      return orderService.checkout(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ORDERS })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, paymentStatus }: { id: string; status: OrderStatus; paymentStatus?: PaymentStatus }) =>
      orderService.updateOrderStatus(id, status, paymentStatus),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(order.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ORDERS })
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ORDERS })
    },
  })
}
