import type { ReactNode } from 'react'

interface Props {
  variant?: 'delete'
  children: ReactNode
}

/** Scrollable content area of an admin dialog. */
export default function AdminModalBody({ variant, children }: Props) {
  return (
    <div className={`adm-modal-body${variant ? ` adm-modal-body--${variant}` : ''}`}>
      {children}
    </div>
  )
}
