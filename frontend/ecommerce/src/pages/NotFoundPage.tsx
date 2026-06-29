import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-8xl font-bold text-indigo-600">404</h1>
        <p className="text-xl text-gray-600 mt-4 mb-8">Page not found.</p>
        <Link to={ROUTES.HOME}>
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
