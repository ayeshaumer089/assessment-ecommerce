import type { CSSProperties, ReactNode } from 'react'

/** Each variant maps to the banner style owned by that area's stylesheet. */
type Variant = 'checkout' | 'admin' | 'auth'

const VARIANT_CLASS: Record<Variant, string> = {
  checkout: 'sz-err-banner',
  admin: 'adm-err-banner',
  auth: 'sz-auth-err',
}

interface Props {
  variant: Variant
  children: ReactNode
  style?: CSSProperties
}

/** Inline error message banner. */
export default function ErrorBanner({ variant, children, style }: Props) {
  return (
    <div className={VARIANT_CLASS[variant]} style={style}>
      {children}
    </div>
  )
}
