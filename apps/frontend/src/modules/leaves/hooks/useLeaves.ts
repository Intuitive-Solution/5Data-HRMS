import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi } from '../services/leaveApi'
import type { Leave, LeaveBalance, CreateLeaveRequest } from '@5data-hrms/shared'

const MY_LEAVES_QUERY_KEY = 'my-leaves'
const LEAVE_BALANCE_QUERY_KEY = 'leave-balance'
const HOLIDAYS_QUERY_KEY = 'holidays'

/**
 * Hook to fetch current user's leaves with pagination
 */
export const useMyLeaves = (page = 1) => {
  return useQuery({
    queryKey: [MY_LEAVES_QUERY_KEY, page],
    queryFn: () => leaveApi.getMyLeaves(page).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch leave balance
 */
export const useLeaveBalance = () => {
  return useQuery({
    queryKey: [LEAVE_BALANCE_QUERY_KEY],
    queryFn: () => leaveApi.getLeaveBalance().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create new leave with attachments
 */
export const useCreateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { data: CreateLeaveRequest; files?: File[] }) =>
      leaveApi.createLeave(payload.data, payload.files).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_LEAVES_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete a leave
 */
export const useDeleteLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leaveApi.deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_LEAVES_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_QUERY_KEY] })
    },
  })
}

/**
 * Hook to fetch holidays
 */
export const useHolidays = () => {
  return useQuery({
    queryKey: [HOLIDAYS_QUERY_KEY],
    queryFn: () => leaveApi.getHolidays().then(res => res.data),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

