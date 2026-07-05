import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="grid min-h-dvh place-items-center bg-canvas text-sm font-semibold text-muted">ControlBase wird geladen …</div>
  }

  if (!user) return <Navigate replace state={{ from: location }} to="/login" />
  return children
}
