import { createPortal } from 'react-dom'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import type { ToastType } from '@/store/toastStore'

const ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={17} />,
  error:   <AlertCircle  size={17} />,
  warning: <AlertTriangle size={17} />,
  info:    <Info          size={17} />,
}

const STYLE: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

const ICON_COLOR: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2.5rem)] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={[
            'pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg',
            STYLE[t.type],
          ].join(' ')}
        >
          <span className={`shrink-0 mt-0.5 ${ICON_COLOR[t.type]}`}>{ICON[t.type]}</span>
          <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
