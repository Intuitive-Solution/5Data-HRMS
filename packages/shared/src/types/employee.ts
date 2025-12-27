/**
 * Employee Management Types
 */

export type EmploymentType = 'full_time' | 'contract' | 'part_time' | 'intern';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export interface EmployeeDocument {
  id: string;
  name: string;
  document_type: string;
  file: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface ReportingManager {
  id: string;
  employee_id: string;
  job_title: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface Employee {
  id: string;
  employee_id: string;
  
  // Personal Info
  middle_name?: string;
  personal_email?: string;
  phone_number?: string;
  gender?: Gender;
  address?: string;
  date_of_birth?: string;
  nationality?: string;
  picture?: string;
  employment_status: EmploymentStatus;
  
  // Job Info
  job_title: string;
  probation_policy?: string;
  reporting_manager?: ReportingManager;
  
  // Work Info
  department: string;
  location?: string;
  shift?: string;
  employment_type: EmploymentType;
  date_of_joining: string;
  contract_end_date?: string;
  contractor_company?: string;
  termination_date?: string;
  termination_reason?: string;
  
  // Meta
  created_at: string;
  updated_at: string;
}

export interface EmployeeDetail extends Employee {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  documents: EmployeeDocument[];
}

export interface CreateEmployeeRequest {
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  middle_name?: string;
  personal_email?: string;
  phone_number?: string;
  gender?: Gender;
  address?: string;
  date_of_birth?: string;
  nationality?: string;
  picture?: File;
  job_title: string;
  probation_policy?: string;
  reporting_manager_id?: string;
  department: string;
  location?: string;
  shift?: string;
  employment_type: EmploymentType;
  date_of_joining: string;
  contract_end_date?: string;
  contractor_company?: string;
  termination_date?: string;
  termination_reason?: string;
}

export interface UpdateEmployeeRequest {
  employee_id?: string;
  middle_name?: string;
  personal_email?: string;
  phone_number?: string;
  gender?: Gender;
  address?: string;
  date_of_birth?: string;
  nationality?: string;
  picture?: File;
  employment_status?: EmploymentStatus;
  job_title?: string;
  probation_policy?: string;
  reporting_manager?: string;
  department?: string;
  location?: string;
  shift?: string;
  employment_type?: EmploymentType;
  contract_end_date?: string;
  contractor_company?: string;
  termination_date?: string;
  termination_reason?: string;
}

export interface EmployeeListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Employee[];
}

export interface DocumentUploadRequest {
  name: string;
  document_type: string;
  file: File;
}

