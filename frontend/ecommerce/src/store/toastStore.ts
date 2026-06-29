import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

let _seq = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3500) => {
    const id = `t-${++_seq}`
    set((s) => ({ toasts: [...s.toasts, { id, type, message, duration }] }))
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      duration,
    )
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// Callable outside React components
export const toast = {
  success: (msg: string, dur?: number) =>
    useToastStore.getState().addToast(msg, 'success', dur),
  error: (msg: string, dur?: number) =>
    useToastStore.getState().addToast(msg, 'error', dur),
  info: (msg: string, dur?: number) =>
    useToastStore.getState().addToast(msg, 'info', dur),
  warning: (msg: string, dur?: number) =>
    useToastStore.getState().addToast(msg, 'warning', dur),
}
