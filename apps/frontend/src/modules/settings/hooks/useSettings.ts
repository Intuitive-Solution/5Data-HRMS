import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../services/settingsApi'
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateLocationRequest,
  UpdateLocationRequest,
  CreateHolidayRequest,
  UpdateHolidayRequest,
} from '@5data-hrms/shared'

// Query keys
const DEPARTMENTS_KEY = 'departments'
const LOCATIONS_KEY = 'locations'
const HOLIDAYS_KEY = 'holidays'

// ==================== DEPARTMENTS ====================

/**
 * Hook to fetch all departments
 */
export const useDepartments = (page = 1, search = '', ordering = '') => {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY, page, search, ordering],
    queryFn: () => settingsApi.getDepartments(page, search, ordering).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch single department by ID
 */
export const useDepartment = (id: string | undefined) => {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY, id],
    queryFn: () => settingsApi.getDepartmentById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get departments count
 */
export const useDepartmentsCount = () => {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY, 'count'],
    queryFn: () => settingsApi.getDepartmentsCount().then(res => res.data.count),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create department
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) =>
      settingsApi.createDepartment(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] })
    },
  })
}

/**
 * Hook to update department
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      settingsApi.updateDepartment(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] })
    },
  })
}

/**
 * Hook to delete department
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] })
    },
  })
}

/**
 * Hook to fetch only active departments for dropdowns
 * Fetches all active departments (page size 1000 to get all in one request)
 */
export const useActiveDepartments = () => {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY, 'active'],
    queryFn: () => settingsApi.getDepartments(1, '', 'name', 'active').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== LOCATIONS ====================

/**
 * Hook to fetch all locations
 */
export const useLocations = (page = 1, search = '', ordering = '') => {
  return useQuery({
    queryKey: [LOCATIONS_KEY, page, search, ordering],
    queryFn: () => settingsApi.getLocations(page, search, ordering).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch single location by ID
 */
export const useLocation = (id: string | undefined) => {
  return useQuery({
    queryKey: [LOCATIONS_KEY, id],
    queryFn: () => settingsApi.getLocationById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get locations count
 */
export const useLocationsCount = () => {
  return useQuery({
    queryKey: [LOCATIONS_KEY, 'count'],
    queryFn: () => settingsApi.getLocationsCount().then(res => res.data.count),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create location
 */
export const useCreateLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLocationRequest) =>
      settingsApi.createLocation(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] })
    },
  })
}

/**
 * Hook to update location
 */
export const useUpdateLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      settingsApi.updateLocation(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] })
    },
  })
}

/**
 * Hook to delete location
 */
export const useDeleteLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] })
    },
  })
}

/**
 * Hook to fetch only active locations for dropdowns
 * Fetches all active locations (page size 1000 to get all in one request)
 */
export const useActiveLocations = () => {
  return useQuery({
    queryKey: [LOCATIONS_KEY, 'active'],
    queryFn: () => settingsApi.getLocations(1, '', 'name', 'active').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== HOLIDAYS ====================

/**
 * Hook to fetch all holidays
 */
export const useHolidays = (page = 1, search = '', ordering = '', year = '') => {
  return useQuery({
    queryKey: [HOLIDAYS_KEY, page, search, ordering, year],
    queryFn: () => settingsApi.getHolidays(page, search, ordering, year).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch holiday years
 */
export const useHolidayYears = () => {
  return useQuery({
    queryKey: [HOLIDAYS_KEY, 'years'],
    queryFn: () => settingsApi.getHolidayYears().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch single holiday by ID
 */
export const useHoliday = (id: string | undefined) => {
  return useQuery({
    queryKey: [HOLIDAYS_KEY, id],
    queryFn: () => settingsApi.getHolidayById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get holidays count
 */
export const useHolidaysCount = () => {
  return useQuery({
    queryKey: [HOLIDAYS_KEY, 'count'],
    queryFn: () => settingsApi.getHolidaysCount().then(res => res.data.count),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create holiday
 */
export const useCreateHoliday = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateHolidayRequest) =>
      settingsApi.createHoliday(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOLIDAYS_KEY] })
    },
  })
}

/**
 * Hook to update holiday
 */
export const useUpdateHoliday = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHolidayRequest }) =>
      settingsApi.updateHoliday(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOLIDAYS_KEY] })
    },
  })
}

/**
 * Hook to delete holiday
 */
export const useDeleteHoliday = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOLIDAYS_KEY] })
    },
  })
}

