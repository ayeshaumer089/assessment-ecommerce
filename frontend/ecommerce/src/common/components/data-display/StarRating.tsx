import { Star } from 'lucide-react'

interface Props {
  rating: number
  count: number
}

/** Compact Tailwind-styled rating used on the product grid cards. */
export default function StarRating({ rating, count }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            className={
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-[11px] text-gray-400 leading-none">({count})</span>
    </div>
  )
}
