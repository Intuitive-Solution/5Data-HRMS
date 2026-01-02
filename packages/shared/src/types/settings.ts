/**
 * Settings types for Departments, Locations, and Holidays.
 */

// Status type for Department and Location
export type EntityStatus = 'active' | 'inactive';

// Department types
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: EntityStatus;
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
  code?: string;
  description?: string;
  status?: EntityStatus;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  status?: EntityStatus;
}

// Location types
export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  status: EntityStatus;
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
  code?: string;
  address?: string;
  status?: EntityStatus;
}

export interface UpdateLocationRequest {
  name?: string;
  code?: string;
  address?: string;
  status?: EntityStatus;
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

// Client types
export interface Client {
  id: string;
  code: string;
  name: string;
  description: string;
  address: string;
  contact_person: string;
  person_name: string;
  email: string;
  phone: string;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface ClientListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Client[];
}

export interface CreateClientRequest {
  code: string;
  name: string;
  description?: string;
  address?: string;
  contact_person?: string;
  person_name?: string;
  email?: string;
  phone?: string;
  status?: EntityStatus;
}

export interface UpdateClientRequest {
  code?: string;
  name?: string;
  description?: string;
  address?: string;
  contact_person?: string;
  person_name?: string;
  email?: string;
  phone?: string;
  status?: EntityStatus;
}

