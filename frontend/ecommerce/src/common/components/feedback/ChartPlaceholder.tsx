interface Props {
  glyph: string
  message: string
}

/** Dashed stand-in shown where a chart has no data to draw. */
export default function ChartPlaceholder({ glyph, message }: Props) {
  return (
    <div
      style={{
        height: 260,
        border: '1.5px dashed var(--line)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        color: '#B4AECB',
        fontSize: 13.5,
        fontWeight: 500,
        background: '#FBFAFD',
      }}
    >
      <span style={{ fontSize: 26 }}>{glyph}</span> {message}
    </div>
  )
}
