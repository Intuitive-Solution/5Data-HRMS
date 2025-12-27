import api from '@/services/api'
import type {
  Employee,
  EmployeeDetail,
  EmployeeListResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeDocument,
  DocumentUploadRequest,
} from '@5data-hrms/shared'

const EMPLOYEE_BASE_URL = '/employees'

export const employeeApi = {
  /**
   * Get all employees with pagination and filtering
   */
  getEmployees: (page = 1, search = '', ordering = 'employee_id') => {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
      ordering,
    })
    return api.get<EmployeeListResponse>(`${EMPLOYEE_BASE_URL}/?${params}`)
  },

  /**
   * Get employee by ID
   */
  getEmployeeById: (id: string) => {
    return api.get<EmployeeDetail>(`${EMPLOYEE_BASE_URL}/${id}/`)
  },

  /**
   * Get current user's employee profile
   */
  getMyProfile: () => {
    return api.get<EmployeeDetail>(`${EMPLOYEE_BASE_URL}/me/`)
  },

  /**
   * Create new employee
   */
  createEmployee: (data: CreateEmployeeRequest) => {
    const formData = new FormData()
    
    // User fields
    formData.append('email', data.email)
    formData.append('first_name', data.first_name)
    formData.append('last_name', data.last_name)
    
    // Personal Info
    formData.append('employee_id', data.employee_id)
    if (data.middle_name) formData.append('middle_name', data.middle_name)
    if (data.personal_email) formData.append('personal_email', data.personal_email)
    if (data.phone_number) formData.append('phone_number', data.phone_number)
    if (data.gender) formData.append('gender', data.gender)
    if (data.address) formData.append('address', data.address)
    if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth)
    if (data.nationality) formData.append('nationality', data.nationality)
    if (data.picture) formData.append('picture', data.picture)
    
    // Job Info
    formData.append('job_title', data.job_title)
    if (data.probation_policy) formData.append('probation_policy', data.probation_policy)
    if (data.reporting_manager_id) formData.append('reporting_manager_id', data.reporting_manager_id)
    
    // Work Info
    formData.append('department', data.department)
    if (data.location) formData.append('location', data.location)
    if (data.shift) formData.append('shift', data.shift)
    formData.append('employment_type', data.employment_type)
    formData.append('date_of_joining', data.date_of_joining)
    if (data.contract_end_date) formData.append('contract_end_date', data.contract_end_date)
    if (data.contractor_company) formData.append('contractor_company', data.contractor_company)
    if (data.termination_date) formData.append('termination_date', data.termination_date)
    if (data.termination_reason) formData.append('termination_reason', data.termination_reason)
    
    return api.post<EmployeeDetail>(`${EMPLOYEE_BASE_URL}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Update employee
   */
  updateEmployee: (id: string, data: UpdateEmployeeRequest) => {
    const formData = new FormData()
    
    // Personal Info
    if (data.middle_name !== undefined) formData.append('middle_name', data.middle_name || '')
    if (data.personal_email !== undefined) formData.append('personal_email', data.personal_email || '')
    if (data.phone_number !== undefined) formData.append('phone_number', data.phone_number || '')
    if (data.gender !== undefined) formData.append('gender', data.gender || '')
    if (data.address !== undefined) formData.append('address', data.address || '')
    if (data.date_of_birth !== undefined) formData.append('date_of_birth', data.date_of_birth || '')
    if (data.nationality !== undefined) formData.append('nationality', data.nationality || '')
    if (data.picture) formData.append('picture', data.picture)
    if (data.employment_status !== undefined) formData.append('employment_status', data.employment_status || '')
    
    // Job Info
    if (data.job_title !== undefined) formData.append('job_title', data.job_title || '')
    if (data.probation_policy !== undefined) formData.append('probation_policy', data.probation_policy || '')
    if (data.reporting_manager !== undefined) formData.append('reporting_manager', data.reporting_manager || '')
    
    // Work Info
    if (data.department !== undefined) formData.append('department', data.department || '')
    if (data.location !== undefined) formData.append('location', data.location || '')
    if (data.shift !== undefined) formData.append('shift', data.shift || '')
    if (data.employment_type !== undefined) formData.append('employment_type', data.employment_type || '')
    if (data.contract_end_date !== undefined) formData.append('contract_end_date', data.contract_end_date || '')
    if (data.contractor_company !== undefined) formData.append('contractor_company', data.contractor_company || '')
    if (data.termination_date !== undefined) formData.append('termination_date', data.termination_date || '')
    if (data.termination_reason !== undefined) formData.append('termination_reason', data.termination_reason || '')
    
    return api.patch<EmployeeDetail>(`${EMPLOYEE_BASE_URL}/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Delete employee (soft delete)
   */
  deleteEmployee: (id: string) => {
    return api.delete(`${EMPLOYEE_BASE_URL}/${id}/`)
  },

  /**
   * Upload document for employee
   */
  uploadDocument: (employeeId: string, data: DocumentUploadRequest) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('document_type', data.document_type)
    formData.append('file', data.file)
    
    return api.post<EmployeeDocument>(
      `${EMPLOYEE_BASE_URL}/${employeeId}/upload_document/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

  /**
   * Get documents for employee
   */
  getEmployeeDocuments: (employeeId: string) => {
    return api.get<EmployeeDocument[]>(`${EMPLOYEE_BASE_URL}/${employeeId}/documents/`)
  },

  /**
   * Delete document
   */
  deleteDocument: (employeeId: string, documentId: string) => {
    return api.delete(`${EMPLOYEE_BASE_URL}/${employeeId}/delete_document/?doc_id=${documentId}`)
  },
}

