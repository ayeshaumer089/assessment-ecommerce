import StarRow from './StarRow'

interface Props {
  rating: number
  count: number
}

/** Rating row on the product detail page — stars, score and review count. */
export default function SzStarRating({ rating, count }: Props) {
  return (
    <div className="sz-rating-row">
      <StarRow rating={rating} size={14} precise className="stars" />
      <span className="score">{rating.toFixed(1)}</span>
      <span className="count">({count} reviews)</span>
    </div>
  )
}
