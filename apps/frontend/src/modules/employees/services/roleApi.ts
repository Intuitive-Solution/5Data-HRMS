import api from '@/services/api'
import type { UserRole } from '@5data-hrms/shared'

export interface Role {
  id: number
  name: string
  display_name: string
  description: string
}

export interface UserRoleResponse {
  id: number
  role: number
  role_name: string
  role_display_name: string
  assigned_at: string
  assigned_by_email: string | null
}

/**
 * Fetch all available roles
 */
export const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get('/auth/roles/')
  return response.data
}

/**
 * Get roles for a specific user
 */
export const getUserRoles = async (userId: string): Promise<UserRoleResponse[]> => {
  const response = await api.get('/auth/user-roles/user_roles/', {
    params: { user_id: userId },
  })
  return response.data
}

/**
 * Assign a role to a user
 */
export const assignRoleToUser = async (
  userId: string,
  roleName: string
): Promise<UserRoleResponse> => {
  const response = await api.post('/auth/user-roles/assign_role/', {
    user_id: userId,
    role_name: roleName,
  })
  return response.data
}

/**
 * Remove a role from a user
 */
export const removeRoleFromUser = async (
  userId: string,
  roleName: string
): Promise<void> => {
  await api.post('/auth/user-roles/remove_role/', {
    user_id: userId,
    role_name: roleName,
  })
}

