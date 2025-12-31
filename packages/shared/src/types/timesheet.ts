/**
 * Timesheet Management Types
 */

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TimesheetRow {
  id: string;
  project: string;
  project_name: string;
  project_client: string;
  task_description: string;
  sun_hours: number;
  mon_hours: number;
  tue_hours: number;
  wed_hours: number;
  thu_hours: number;
  fri_hours: number;
  sat_hours: number;
  row_total: number;
  created_at: string;
  updated_at: string;
}

export interface Timesheet {
  id: string;
  employee: string;
  employee_id: string;
  employee_name: string;
  week_start: string;
  week_end: string;
  status: TimesheetStatus;
  total_hours: number;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  approved_by_name?: string;
  rejection_reason?: string;
  rows?: TimesheetRow[];
  daily_totals?: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface TimesheetDetail extends Timesheet {
  rows: TimesheetRow[];
  daily_totals: Record<string, number>;
}

export interface CreateTimesheetRowRequest {
  project: string;
  task_description: string;
  sun_hours: number;
  mon_hours: number;
  tue_hours: number;
  wed_hours: number;
  thu_hours: number;
  fri_hours: number;
  sat_hours: number;
}

export interface CreateTimesheetRequest {
  week_start: string;
  week_end: string;
  rows: CreateTimesheetRowRequest[];
}

export interface UpdateTimesheetRequest {
  week_start?: string;
  week_end?: string;
  rows: CreateTimesheetRowRequest[];
}

export interface TimesheetApprovalRequest {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface TimesheetListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Timesheet[];
}



