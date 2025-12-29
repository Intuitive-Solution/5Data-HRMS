import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../services/employeeApi'
import type {
  Employee,
  EmployeeDetail,
  EmployeeListResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeDocument,
  DocumentUploadRequest,
} from '@5data-hrms/shared'

const EMPLOYEE_QUERY_KEY = 'employees'

/**
 * Hook to fetch all employees with pagination
 */
export const useEmployees = (page = 1, search = '', ordering = 'employee_id') => {
  return useQuery({
    queryKey: [EMPLOYEE_QUERY_KEY, page, search, ordering],
    queryFn: () => employeeApi.getEmployees(page, search, ordering).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single employee by ID
 */
export const useEmployee = (id: string | undefined) => {
  return useQuery({
    queryKey: [EMPLOYEE_QUERY_KEY, id],
    queryFn: () => employeeApi.getEmployeeById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch current user's employee profile
 */
export const useMyEmployeeProfile = () => {
  return useQuery({
    queryKey: [EMPLOYEE_QUERY_KEY, 'me'],
    queryFn: () => employeeApi.getMyProfile().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create new employee
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => 
      employeeApi.createEmployee(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] })
    },
  })
}

/**
 * Hook to update employee
 */
export const useUpdateEmployee = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => 
      employeeApi.updateEmployee(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete employee
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeApi.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] })
    },
  })
}

/**
 * Hook to fetch employee documents
 */
export const useEmployeeDocuments = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: [EMPLOYEE_QUERY_KEY, employeeId, 'documents'],
    queryFn: () => employeeApi.getEmployeeDocuments(employeeId!).then(res => res.data),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to upload document
 */
export const useUploadDocument = (employeeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DocumentUploadRequest) => 
      employeeApi.uploadDocument(employeeId, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [EMPLOYEE_QUERY_KEY, employeeId, 'documents'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: [EMPLOYEE_QUERY_KEY, employeeId] 
      })
    },
  })
}

/**
 * Hook to delete document
 */
export const useDeleteDocument = (employeeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => 
      employeeApi.deleteDocument(employeeId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [EMPLOYEE_QUERY_KEY, employeeId, 'documents'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: [EMPLOYEE_QUERY_KEY, employeeId] 
      })
    },
  })
}

/**
 * Hook to get active employee count
 * Fetches all employees across all pages and counts active ones
 */
export const useActiveEmployeeCount = () => {
  return useQuery({
    queryKey: [EMPLOYEE_QUERY_KEY, 'active-count'],
    queryFn: async () => {
      let allEmployees: Employee[] = []
      let page = 1
      let hasMore = true
      
      // Fetch all pages
      while (hasMore) {
        const response = await employeeApi.getEmployees(page, '', 'employee_id')
        allEmployees = [...allEmployees, ...response.data.results]
        
        hasMore = !!response.data.next
        page++
        
        // Safety limit to prevent infinite loops
        if (page > 100) break
      }
      
      // Count active employees
      const activeCount = allEmployees.filter(
        (employee) => employee.employment_status === 'active'
      ).length
      
      return activeCount
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

