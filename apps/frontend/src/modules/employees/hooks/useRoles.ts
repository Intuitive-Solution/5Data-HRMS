import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRoles,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  type Role,
  type UserRoleResponse,
} from '../services/roleApi'

/**
 * Hook to fetch all available roles
 */
export const useFetchRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })
}

/**
 * Hook to fetch roles for a specific user
 */
export const useGetUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: () => getUserRoles(userId!),
    enabled: !!userId,
  })
}

/**
 * Hook to assign a role to a user
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      assignRoleToUser(userId, roleName),
    onSuccess: (_, { userId }) => {
      // Invalidate user roles query
      queryClient.invalidateQueries({ queryKey: ['user-roles', userId] })
    },
  })
}

/**
 * Hook to remove a role from a user
 */
export const useRemoveRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      removeRoleFromUser(userId, roleName),
    onSuccess: (_, { userId }) => {
      // Invalidate user roles query
      queryClient.invalidateQueries({ queryKey: ['user-roles', userId] })
    },
  })
}

