import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session)
  if (!session) return <Navigate to="/auth" replace />
  return <Outlet />
}
