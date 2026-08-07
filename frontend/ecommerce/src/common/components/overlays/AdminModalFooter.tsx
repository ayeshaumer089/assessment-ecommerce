import type { ReactNode } from 'react'
import ErrorBanner from '../feedback/ErrorBanner'

interface Props {
  bordered?: boolean
  /** Shown above the actions when the last submission failed. */
  error?: ReactNode
  children: ReactNode
}

/** Admin dialog action bar, with an optional error banner above it. */
export default function AdminModalFooter({ bordered, error, children }: Props) {
  return (
    <div className={`adm-modal-footer${bordered ? ' adm-modal-footer--bordered' : ''}`}>
      {error && <ErrorBanner variant="admin">{error}</ErrorBanner>}
      <div className="adm-footer-btns">{children}</div>
    </div>
  )
}
