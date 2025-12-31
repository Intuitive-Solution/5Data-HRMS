import api from '@/services/api'
import type {
  Timesheet,
  TimesheetDetail,
  TimesheetListResponse,
  CreateTimesheetRequest,
  UpdateTimesheetRequest,
  TimesheetApprovalRequest,
} from '@5data-hrms/shared'

const TIMESHEET_BASE_URL = '/timesheets'

export const timesheetApi = {
  /**
   * Get all timesheets with pagination
   */
  getTimesheets: (page = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
    })
    return api.get<TimesheetListResponse>(`${TIMESHEET_BASE_URL}/?${params}`)
  },

  /**
   * Get current user's timesheets
   */
  getMyTimesheets: () => {
    return api.get<Timesheet[]>(`${TIMESHEET_BASE_URL}/my_timesheets/`)
  },

  /**
   * Get single timesheet by ID
   */
  getTimesheetById: (id: string) => {
    return api.get<TimesheetDetail>(`${TIMESHEET_BASE_URL}/${id}/`)
  },

  /**
   * Create new timesheet
   */
  createTimesheet: (data: CreateTimesheetRequest) => {
    return api.post<TimesheetDetail>(`${TIMESHEET_BASE_URL}/`, {
      week_start: data.week_start,
      week_end: data.week_end,
      rows: data.rows,
    })
  },

  /**
   * Update timesheet
   */
  updateTimesheet: (id: string, data: UpdateTimesheetRequest) => {
    return api.patch<TimesheetDetail>(`${TIMESHEET_BASE_URL}/${id}/`, {
      week_start: data.week_start,
      week_end: data.week_end,
      rows: data.rows,
    })
  },

  /**
   * Delete timesheet (soft delete)
   */
  deleteTimesheet: (id: string) => {
    return api.delete(`${TIMESHEET_BASE_URL}/${id}/`)
  },

  /**
   * Submit a timesheet
   */
  submitTimesheet: (id: string) => {
    return api.post<TimesheetDetail>(`${TIMESHEET_BASE_URL}/${id}/submit/`, {})
  },

  /**
   * Approve a timesheet (manager only)
   */
  approveTimesheet: (id: string) => {
    return api.post<TimesheetDetail>(
      `${TIMESHEET_BASE_URL}/${id}/approve/`,
      { action: 'approve' }
    )
  },

  /**
   * Reject a timesheet (manager only)
   */
  rejectTimesheet: (id: string, rejectionReason: string) => {
    return api.post<TimesheetDetail>(
      `${TIMESHEET_BASE_URL}/${id}/reject/`,
      { action: 'reject', rejection_reason: rejectionReason }
    )
  },

  /**
   * Get team's submitted timesheets for approval (reporting managers only)
   */
  getTeamTimesheets: () => {
    return api.get<Timesheet[]>(`${TIMESHEET_BASE_URL}/team/`)
  },
}

