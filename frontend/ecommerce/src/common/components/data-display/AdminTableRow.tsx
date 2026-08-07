import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/** Admin table body row with the shared hover highlight. */
export default function AdminTableRow({ children }: Props) {
  return (
    <tr
      style={{ borderBottom: '1px solid var(--line)', transition: 'background .15s ease', cursor: 'default' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9FE')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      {children}
    </tr>
  )
}
