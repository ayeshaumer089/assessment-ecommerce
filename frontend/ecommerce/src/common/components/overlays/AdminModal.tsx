import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  onClose: () => void
  /** id of the heading element that names this dialog. */
  labelledBy: string
  size?: 'sm'
  children: ReactNode
}

/**
 * Portalled admin dialog shell. Compose it with AdminModalHeader / Body /
 * Footer. Scroll locking and Escape handling stay with the owning page, which
 * may have more than one dialog in flight.
 */
export default function AdminModal({ open, onClose, labelledBy, size, children }: Props) {
  if (!open) return null

  return createPortal(
    <div
      className="adm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`adm-modal${size === 'sm' ? ' adm-modal--sm' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
