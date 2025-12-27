/**
 * Employee Management Types
 */

export type EmploymentType = 'full_time' | 'contract' | 'part_time' | 'intern';

export interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  department: string;
  job_role: string;
  employment_type: EmploymentType;
  date_of_joining: string;
  contract_end_date?: string;
  reporting_manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDetail extends Employee {
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  reporting_manager?: {
    id: string;
    employee_id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface CreateEmployeeRequest {
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  department: string;
  job_role: string;
  employment_type: EmploymentType;
  date_of_joining: string;
  contract_end_date?: string;
  reporting_manager_id?: string;
}

export interface UpdateEmployeeRequest {
  department?: string;
  job_role?: string;
  employment_type?: EmploymentType;
  contract_end_date?: string;
  reporting_manager_id?: string;
  is_active?: boolean;
}

export interface EmployeeListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Employee[];
}

