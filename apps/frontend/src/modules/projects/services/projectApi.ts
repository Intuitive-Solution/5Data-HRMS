import api from '@/services/api'
import type {
  Project,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectAssignment,
} from '@5data-hrms/shared'

const PROJECT_BASE_URL = '/projects'
const ASSIGNMENT_BASE_URL = '/projects/assignments'

export const projectApi = {
  /**
   * Get all projects with pagination, search, and filtering
   */
  getProjects: (page = 1, search = '', ordering = 'name', status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
      ordering,
    })
    if (status) {
      params.append('status', status)
    }
    return api.get<ProjectListResponse>(`${PROJECT_BASE_URL}/?${params}`)
  },

  /**
   * Get project by ID
   */
  getProjectById: (id: string) => {
    return api.get<Project>(`${PROJECT_BASE_URL}/${id}/`)
  },

  /**
   * Create new project
   */
  createProject: (data: CreateProjectRequest) => {
    return api.post<Project>(`${PROJECT_BASE_URL}/`, {
      name: data.name,
      client: data.client,
      billing_type: data.billing_type,
      start_date: data.start_date,
      end_date: data.end_date || null,
      description: data.description || '',
    })
  },

  /**
   * Update project
   */
  updateProject: (id: string, data: UpdateProjectRequest) => {
    const payload: Record<string, any> = {}
    
    if (data.name !== undefined) payload.name = data.name
    if (data.client !== undefined) payload.client = data.client
    if (data.billing_type !== undefined) payload.billing_type = data.billing_type
    if (data.start_date !== undefined) payload.start_date = data.start_date
    if (data.end_date !== undefined) payload.end_date = data.end_date
    if (data.status !== undefined) payload.status = data.status
    if (data.description !== undefined) payload.description = data.description
    
    return api.patch<Project>(`${PROJECT_BASE_URL}/${id}/`, payload)
  },

  /**
   * Delete project (soft delete)
   */
  deleteProject: (id: string) => {
    return api.delete(`${PROJECT_BASE_URL}/${id}/`)
  },

  /**
   * Get assignments for a project
   */
  getProjectAssignments: (projectId: string) => {
    const params = new URLSearchParams({
      project: projectId,
    })
    return api.get<ProjectAssignment[]>(
      `${ASSIGNMENT_BASE_URL}/?${params}`
    )
  },

  /**
   * Create new assignment
   */
  createAssignment: (data: {
    employee: string
    project: string
    role: string
    allocation_percentage: number
    assigned_date: string
  }) => {
    return api.post<ProjectAssignment>(`${ASSIGNMENT_BASE_URL}/`, data)
  },

  /**
   * Update assignment
   */
  updateAssignment: (id: string, data: {
    role?: string
    allocation_percentage?: number
    unassigned_date?: string | null
  }) => {
    return api.patch<ProjectAssignment>(`${ASSIGNMENT_BASE_URL}/${id}/`, data)
  },

  /**
   * Delete assignment
   */
  deleteAssignment: (id: string) => {
    return api.delete(`${ASSIGNMENT_BASE_URL}/${id}/`)
  },

  /**
   * Get current user's assigned projects (active projects only)
   */
  getMyAssignedProjects: () => {
    return api.get<Project[]>(`${PROJECT_BASE_URL}/my_projects/`)
  },
}

