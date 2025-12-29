import { Navigate } from 'react-router-dom'
import type { UserRole } from '@5data-hrms/shared'
import { useHasAnyRole, useIsAuthenticated } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
}

/**
 * Component to protect routes based on authentication and optional role requirements
 */
export const ProtectedRoute = ({
  children,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated()
  const hasRequiredRole = requiredRoles ? useHasAnyRole(requiredRoles) : true

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasRequiredRole) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute



