import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <h1 className="text-5xl font-bold text-gray-900">Welcome to ShopZone</h1>
      <p className="text-lg text-gray-500 max-w-md">
        Discover quality products at unbeatable prices.
      </p>
      <Link to={ROUTES.CUSTOMER.PRODUCTS}>
        <Button size="lg">Shop Now</Button>
      </Link>
    </div>
  )
}
