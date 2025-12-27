/**
 * Timesheet Management Types
 */

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TimesheetEntry {
  id: string;
  date: string;
  project_id: string;
  hours: number;
  task_description: string;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  week_start: string;
  week_end: string;
  status: TimesheetStatus;
  total_hours: number;
  submitted_at?: string;
  approved_at?: string;
  approved_by_id?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface TimesheetDetail extends Timesheet {
  entries: TimesheetEntry[];
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

export interface CreateTimesheetEntryRequest {
  date: string;
  project_id: string;
  hours: number;
  task_description: string;
}

export interface CreateTimesheetRequest {
  week_start: string;
  entries: CreateTimesheetEntryRequest[];
}

export interface UpdateTimesheetRequest {
  entries: CreateTimesheetEntryRequest[];
}

export interface SubmitTimesheetRequest {
  action: 'submit' | 'approve' | 'reject';
  rejection_reason?: string;
}

export interface TimesheetListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Timesheet[];
}

