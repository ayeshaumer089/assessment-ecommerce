import Loader from '@/components/ui/Loader'

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" label="Loading…" />
    </div>
  )
}
