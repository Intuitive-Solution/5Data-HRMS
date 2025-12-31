/**
 * Leave Management Types
 */

export type LeaveType = 'paid_leave' | 'sick_leave' | 'casual_leave' | 'earned_leave' | 'unpaid_leave';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveAttachment {
  id: string;
  file: string;
  name: string;
  uploaded_at: string;
}

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason?: string;
  status: LeaveStatus;
  approved_by_id?: string;
  approved_at?: string;
  attachments?: LeaveAttachment[];
  created_at: string;
  updated_at: string;
}

export interface LeaveDetail extends Leave {
  employee: {
    id: string;
    employee_id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  approved_by?: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface CreateLeaveRequest {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface ApproveLeaveRequest {
  action: 'approve' | 'reject';
  remarks?: string;
}

export interface LeaveBalance {
  paid_leave: number;
  sick_leave: number;
  casual_leave: number;
  earned_leave: number;
  updated_at: string;
}

export interface LeaveListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Leave[];
}



