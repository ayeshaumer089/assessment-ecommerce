import type { ReactNode } from 'react'

interface Props {
  variant: 'accent' | 'delete'
  onClose: () => void
  /** Heading content shown to the left of the close button. */
  children: ReactNode
}

/** Admin dialog header with its dismiss control. */
export default function AdminModalHeader({ variant, onClose, children }: Props) {
  return (
    <div className={`adm-modal-header adm-modal-header--${variant}`}>
      {children}
      <button className="adm-close-btn" onClick={onClose} aria-label="Close">✕</button>
    </div>
  )
}
