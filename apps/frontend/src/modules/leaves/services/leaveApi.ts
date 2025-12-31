import api from '@/services/api'
import type {
  Leave,
  LeaveListResponse,
  LeaveBalance,
  CreateLeaveRequest,
} from '@5data-hrms/shared'

const LEAVE_BASE_URL = '/leaves'

export const leaveApi = {
  /**
   * Get current user's leaves with pagination
   */
  getMyLeaves: (page = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
    })
    return api.get<LeaveListResponse>(`${LEAVE_BASE_URL}/my_leaves/?${params}`)
  },

  /**
   * Get leave balance for current user
   */
  getLeaveBalance: () => {
    return api.get<LeaveBalance>(`${LEAVE_BASE_URL}/balance/`)
  },

  /**
   * Create new leave with attachments
   */
  createLeave: (data: CreateLeaveRequest, files?: File[]) => {
    const formData = new FormData()
    
    formData.append('leave_type', data.leave_type)
    formData.append('start_date', data.start_date)
    formData.append('end_date', data.end_date)
    if (data.reason) {
      formData.append('reason', data.reason)
    }
    
    // Add file attachments
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('attachments', file)
      })
    }
    
    return api.post<Leave>(`${LEAVE_BASE_URL}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Delete a leave
   */
  deleteLeave: (id: string) => {
    return api.delete(`${LEAVE_BASE_URL}/${id}/`)
  },

  /**
   * Get holidays list
   */
  getHolidays: () => {
    return api.get<Array<{ date: string; name: string }>>(`${LEAVE_BASE_URL}/holidays/`)
  },
}

