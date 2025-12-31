import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timesheetApi } from '../services/timesheetApi'
import type {
  Timesheet,
  CreateTimesheetRequest,
  UpdateTimesheetRequest,
} from '@5data-hrms/shared'

const TIMESHEET_QUERY_KEY = 'timesheets'
const MY_TIMESHEETS_QUERY_KEY = 'my-timesheets'
const TEAM_TIMESHEETS_QUERY_KEY = 'team-timesheets'

/**
 * Hook to fetch all timesheets with pagination
 */
export const useTimesheets = (page = 1) => {
  return useQuery({
    queryKey: [TIMESHEET_QUERY_KEY, page],
    queryFn: () => timesheetApi.getTimesheets(page).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch current user's timesheets
 */
export const useMyTimesheets = () => {
  return useQuery({
    queryKey: [MY_TIMESHEETS_QUERY_KEY],
    queryFn: () => timesheetApi.getMyTimesheets().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single timesheet by ID
 */
export const useTimesheet = (id: string | undefined) => {
  return useQuery({
    queryKey: [TIMESHEET_QUERY_KEY, id],
    queryFn: () => timesheetApi.getTimesheetById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create new timesheet
 */
export const useCreateTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTimesheetRequest) =>
      timesheetApi.createTimesheet(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_TIMESHEETS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to update timesheet
 */
export const useUpdateTimesheet = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTimesheetRequest) =>
      timesheetApi.updateTimesheet(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIMESHEET_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [MY_TIMESHEETS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete timesheet
 */
export const useDeleteTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => timesheetApi.deleteTimesheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MY_TIMESHEETS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to submit timesheet
 */
export const useSubmitTimesheet = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => timesheetApi.submitTimesheet(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIMESHEET_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [MY_TIMESHEETS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to approve timesheet (manager only)
 */
export const useApproveTimesheet = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => timesheetApi.approveTimesheet(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIMESHEET_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [TEAM_TIMESHEETS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to reject timesheet (manager only)
 */
export const useRejectTimesheet = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rejectionReason: string) =>
      timesheetApi.rejectTimesheet(id, rejectionReason).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIMESHEET_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [TEAM_TIMESHEETS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to fetch team's timesheets for approval
 */
export const useTeamTimesheets = () => {
  return useQuery({
    queryKey: [TEAM_TIMESHEETS_QUERY_KEY],
    queryFn: () => timesheetApi.getTeamTimesheets().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

