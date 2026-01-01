/**
 * Settings types for Departments, Locations, and Holidays.
 */

// Department types
export interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Department[];
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
}

// Location types
export interface Location {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface LocationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Location[];
}

export interface CreateLocationRequest {
  name: string;
  address?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  address?: string;
}

// Holiday types
export interface Holiday {
  id: string;
  name: string;
  date: string;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
}

export interface HolidayListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Holiday[];
}

export interface CreateHolidayRequest {
  name: string;
  date: string;
  is_optional?: boolean;
}

export interface UpdateHolidayRequest {
  name?: string;
  date?: string;
  is_optional?: boolean;
}

// Count response type
export interface CountResponse {
  count: number;
}

