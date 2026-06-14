import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function ProtectedRoute() {
  const { user, token, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !token) {
    // Preserve the intended destination for redirect-back-after-login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
