import { useSelector } from 'react-redux'
import type { AuthState, UserRole } from '@5data-hrms/shared'
import type { RootState } from '../store'

/**
 * Hook to access the current authentication state and user information
 */
export const useAuth = () => {
  return useSelector((state: RootState) => state.auth)
}

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role: UserRole): boolean => {
  const auth = useAuth()
  return auth.user?.roles?.includes(role) ?? false
}

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: UserRole[]): boolean => {
  const auth = useAuth()
  return roles.some(role => auth.user?.roles?.includes(role)) ?? false
}

/**
 * Hook to check if user has all of the specified roles
 */
export const useHasAllRoles = (roles: UserRole[]): boolean => {
  const auth = useAuth()
  return roles.every(role => auth.user?.roles?.includes(role)) ?? false
}

/**
 * Hook to check if user is a system admin
 */
export const useIsAdmin = (): boolean => {
  return useHasRole('system_admin')
}

/**
 * Hook to check if user is HR user or system admin
 */
export const useIsHROrAdmin = (): boolean => {
  return useHasAnyRole(['hr_user', 'system_admin'])
}

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const auth = useAuth()
  return auth.isAuthenticated
}



