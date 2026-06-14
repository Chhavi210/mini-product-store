import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PublicOnlyRoute() {
  const { user } = useAuthStore()
  const location = useLocation()

  // If already authenticated, send them where they came from or home
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  return <Outlet />
}
