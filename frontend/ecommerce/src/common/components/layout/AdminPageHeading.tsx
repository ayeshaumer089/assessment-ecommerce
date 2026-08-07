interface Props {
  title: string
  description: string
  className?: string
}

/** Tailwind-styled heading block for admin and account screens. */
export default function AdminPageHeading({ title, description, className }: Props) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  )
}
