interface Props {
  rating: number
  count: number
}

/** Glyph-based rating (★ / ☆) used by the ShopZone-styled product cards. */
export default function TextStarRating({ rating, count }: Props) {
  const filled = Math.round(rating || 0)
  return (
    <div className="sz-prod-rating">
      <span style={{ color: 'var(--gold)' }}>{'★'.repeat(filled)}</span>
      {'☆'.repeat(5 - filled)}
      <span className="rc">({count})</span>
    </div>
  )
}
