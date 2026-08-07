import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'cancel' | 'primary' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant
  children: ReactNode
}

/** Footer button inside admin modals. */
export default function AdminButton({ variant, children, ...props }: Props) {
  return (
    <button className={`adm-btn adm-btn-${variant}`} {...props}>
      {children}
    </button>
  )
}
