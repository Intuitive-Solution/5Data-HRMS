/**
 * Common Types Used Across the Application
 */

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status_code: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  timestamp: string;
  ip_address: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogResponse {
  count: number;
  next?: string;
  previous?: string;
  results: AuditLog[];
}

