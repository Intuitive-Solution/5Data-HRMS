/**
 * Project Management Types
 */

export type BillingType = 'time_and_material' | 'fixed_price' | 'non_billable';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  client: string;
  billing_type: BillingType;
  start_date: string;
  end_date?: string;
  status: ProjectStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  id: string;
  employee: string;
  project: string;
  role: string;
  assigned_date: string;
  unassigned_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectRequest {
  name: string;
  client: string;
  billing_type: BillingType;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  client?: string;
  billing_type?: BillingType;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  description?: string;
}

export interface ProjectListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Project[];
}



