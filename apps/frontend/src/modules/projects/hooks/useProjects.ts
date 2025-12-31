import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../services/projectApi'
import type {
  Project,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectAssignment,
} from '@5data-hrms/shared'

const PROJECT_QUERY_KEY = 'projects'
const ASSIGNMENT_QUERY_KEY = 'project-assignments'

/**
 * Hook to fetch all projects with pagination, search, and filtering
 */
export const useProjects = (
  page = 1,
  search = '',
  ordering = 'name',
  status = ''
) => {
  return useQuery({
    queryKey: [PROJECT_QUERY_KEY, page, search, ordering, status],
    queryFn: () =>
      projectApi.getProjects(page, search, ordering, status).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single project by ID
 */
export const useProject = (id: string | undefined) => {
  return useQuery({
    queryKey: [PROJECT_QUERY_KEY, id],
    queryFn: () => projectApi.getProjectById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      projectApi.createProject(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY] })
    },
  })
}

/**
 * Hook to update project
 */
export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProjectRequest) =>
      projectApi.updateProject(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY] })
    },
  })
}

/**
 * Hook to fetch assignments for a project
 */
export const useProjectAssignments = (projectId: string | undefined) => {
  return useQuery({
    queryKey: [ASSIGNMENT_QUERY_KEY, projectId],
    queryFn: () => projectApi.getProjectAssignments(projectId!).then(res => {
      // Handle paginated response - extract results array
      const data = res.data as any
      if (data && Array.isArray(data.results)) {
        return data.results as ProjectAssignment[]
      }
      // If it's already an array, return as-is
      if (Array.isArray(data)) {
        return data as ProjectAssignment[]
      }
      // Return empty array as fallback
      return [] as ProjectAssignment[]
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create new assignment
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      employee: string
      project: string
      role: string
      allocation_percentage: number
      assigned_date: string
    }) => projectApi.createAssignment(data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ASSIGNMENT_QUERY_KEY, variables.project],
      })
    },
  })
}

/**
 * Hook to update assignment
 */
export const useUpdateAssignment = (projectId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        role?: string
        allocation_percentage?: number
        unassigned_date?: string | null
      }
    }) => projectApi.updateAssignment(id, data).then(res => res.data),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [ASSIGNMENT_QUERY_KEY, projectId],
        })
      }
    },
  })
}

/**
 * Hook to delete assignment
 */
export const useDeleteAssignment = (projectId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectApi.deleteAssignment(id),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [ASSIGNMENT_QUERY_KEY, projectId],
        })
      }
    },
  })
}

/**
 * Hook to get active project count
 * Fetches all active projects and returns the count
 */
export const useActiveProjectCount = () => {
  return useQuery({
    queryKey: [PROJECT_QUERY_KEY, 'active-count'],
    queryFn: async () => {
      const response = await projectApi.getProjects(1, '', 'name', 'active')
      return response.data.count || 0
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get current user's assigned projects
 */
export const useMyAssignedProjects = () => {
  return useQuery({
    queryKey: [PROJECT_QUERY_KEY, 'my-projects'],
    queryFn: async () => {
      try {
        const response = await projectApi.getMyAssignedProjects()
        return response.data
      } catch (error) {
        console.error('Failed to fetch assigned projects:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

