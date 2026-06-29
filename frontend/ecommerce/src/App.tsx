import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/app/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import PageLoader from '@/components/common/PageLoader'
import { router } from '@/routes'

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
