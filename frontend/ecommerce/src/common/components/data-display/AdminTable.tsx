import type { CSSProperties, ReactNode } from 'react'

export interface AdminTableColumn {
  label: string
  align?: 'left' | 'right'
}

interface Props {
  columns: AdminTableColumn[]
  /** Table body rows. */
  children: ReactNode
}

const HEAD_CELL: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#9A93AE',
  padding: '14px 18px',
  borderBottom: '1px solid var(--line)',
  background: '#FBFAFD',
  whiteSpace: 'nowrap',
}

/** Horizontally scrollable admin data table with a styled header row. */
export default function AdminTable({ columns, children }: Props) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ textAlign: col.align ?? 'left', ...HEAD_CELL }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
