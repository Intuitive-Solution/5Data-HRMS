/**
 * Shared Constants across the application
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_VERSION = 'v1';
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// User Roles
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  REPORTING_MANAGER: 'reporting_manager',
  PROJECT_LEAD: 'project_lead',
  PROJECT_MANAGER: 'project_manager',
  HR_USER: 'hr_user',
  FINANCE_USER: 'finance_user',
  SYSTEM_ADMIN: 'system_admin',
} as const;

// Leave Types
export const LEAVE_TYPES = {
  SICK_LEAVE: 'sick_leave',
  CASUAL_LEAVE: 'casual_leave',
  EARNED_LEAVE: 'earned_leave',
  UNPAID_LEAVE: 'unpaid_leave',
} as const;

// Leave Limits (per year)
export const LEAVE_LIMITS = {
  sick_leave: 5,
  casual_leave: 5,
  earned_leave: 1.5 * 12, // 1.5 per month
  unpaid_leave: -1, // Unlimited
} as const;

// Leave Status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Timesheet Status
export const TIMESHEET_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Timesheet Rules
export const TIMESHEET_RULES = {
  MAX_HOURS_PER_DAY: 8,
  MAX_HOURS_PER_WEEK: 40,
} as const;

// Employment Types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  CONTRACT: 'contract',
  PART_TIME: 'part_time',
  INTERN: 'intern',
} as const;

// Billing Types
export const BILLING_TYPES = {
  TIME_AND_MATERIAL: 'time_and_material',
  FIXED_PRICE: 'fixed_price',
  NON_BILLABLE: 'non_billable',
} as const;

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// UI Design System
export const BRAND_COLORS = {
  PRIMARY: '#0B4FB3',
  PRIMARY_HOVER: '#1E6FD9',
  SURFACE: '#F4F6FA',
  BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  DIVIDER: '#9CA3AF',
} as const;

// Token Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

