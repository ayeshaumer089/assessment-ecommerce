import Loader from '@/components/ui/Loader'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className }: Props) {
  return <Loader size={size} className={className} />
}
