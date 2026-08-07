import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Right-hand slide-over panel, shown below the `lg` breakpoint only. */
export default function Drawer({ open, onClose, title, children }: Props) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl flex flex-col lg:hidden">
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--line)] shrink-0">
          <h3 className="font-semibold text-[var(--ink)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  )
}
