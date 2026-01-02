import api from '@/services/api'
import type {
  Department,
  DepartmentListResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Client,
  ClientListResponse,
  CreateClientRequest,
  UpdateClientRequest,
  Location,
  LocationListResponse,
  CreateLocationRequest,
  UpdateLocationRequest,
  Holiday,
  HolidayListResponse,
  CreateHolidayRequest,
  UpdateHolidayRequest,
  CountResponse,
} from '@5data-hrms/shared'

const SETTINGS_BASE_URL = '/settings'

export const settingsApi = {
  // ==================== DEPARTMENTS ====================

  /**
   * Get all departments with pagination, sorting, and optional status filter
   */
  getDepartments: (page = 1, search = '', ordering = '', status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    })
    if (ordering) {
      params.append('ordering', ordering)
    }
    if (status) {
      params.append('status', status)
    }
    return api.get<DepartmentListResponse>(`${SETTINGS_BASE_URL}/departments/?${params}`)
  },

  /**
   * Get department by ID
   */
  getDepartmentById: (id: string) => {
    return api.get<Department>(`${SETTINGS_BASE_URL}/departments/${id}/`)
  },

  /**
   * Create new department
   */
  createDepartment: (data: CreateDepartmentRequest) => {
    return api.post<Department>(`${SETTINGS_BASE_URL}/departments/`, data)
  },

  /**
   * Update department
   */
  updateDepartment: (id: string, data: UpdateDepartmentRequest) => {
    return api.put<Department>(`${SETTINGS_BASE_URL}/departments/${id}/`, data)
  },

  /**
   * Delete department
   */
  deleteDepartment: (id: string) => {
    return api.delete(`${SETTINGS_BASE_URL}/departments/${id}/`)
  },

  /**
   * Get departments count
   */
  getDepartmentsCount: () => {
    return api.get<CountResponse>(`${SETTINGS_BASE_URL}/departments/count/`)
  },

  // ==================== LOCATIONS ====================

  /**
   * Get all locations with pagination, sorting, and optional status filter
   */
  getLocations: (page = 1, search = '', ordering = '', status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    })
    if (ordering) {
      params.append('ordering', ordering)
    }
    if (status) {
      params.append('status', status)
    }
    return api.get<LocationListResponse>(`${SETTINGS_BASE_URL}/locations/?${params}`)
  },

  /**
   * Get location by ID
   */
  getLocationById: (id: string) => {
    return api.get<Location>(`${SETTINGS_BASE_URL}/locations/${id}/`)
  },

  /**
   * Create new location
   */
  createLocation: (data: CreateLocationRequest) => {
    return api.post<Location>(`${SETTINGS_BASE_URL}/locations/`, data)
  },

  /**
   * Update location
   */
  updateLocation: (id: string, data: UpdateLocationRequest) => {
    return api.put<Location>(`${SETTINGS_BASE_URL}/locations/${id}/`, data)
  },

  /**
   * Delete location
   */
  deleteLocation: (id: string) => {
    return api.delete(`${SETTINGS_BASE_URL}/locations/${id}/`)
  },

  /**
   * Get locations count
   */
  getLocationsCount: () => {
    return api.get<CountResponse>(`${SETTINGS_BASE_URL}/locations/count/`)
  },

  // ==================== HOLIDAYS ====================

  /**
   * Get all holidays with pagination, sorting, and year filter
   */
  getHolidays: (page = 1, search = '', ordering = '', year = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    })
    if (ordering) {
      params.append('ordering', ordering)
    }
    if (year) {
      params.append('year', year)
    }
    return api.get<HolidayListResponse>(`${SETTINGS_BASE_URL}/holidays/?${params}`)
  },

  /**
   * Get list of years that have holidays
   */
  getHolidayYears: () => {
    return api.get<number[]>(`${SETTINGS_BASE_URL}/holidays/years/`)
  },

  /**
   * Get holiday by ID
   */
  getHolidayById: (id: string) => {
    return api.get<Holiday>(`${SETTINGS_BASE_URL}/holidays/${id}/`)
  },

  /**
   * Create new holiday
   */
  createHoliday: (data: CreateHolidayRequest) => {
    return api.post<Holiday>(`${SETTINGS_BASE_URL}/holidays/`, data)
  },

  /**
   * Update holiday
   */
  updateHoliday: (id: string, data: UpdateHolidayRequest) => {
    return api.put<Holiday>(`${SETTINGS_BASE_URL}/holidays/${id}/`, data)
  },

  /**
   * Delete holiday
   */
  deleteHoliday: (id: string) => {
    return api.delete(`${SETTINGS_BASE_URL}/holidays/${id}/`)
  },

  /**
   * Get holidays count
   */
  getHolidaysCount: () => {
    return api.get<CountResponse>(`${SETTINGS_BASE_URL}/holidays/count/`)
  },

  // ==================== CLIENTS ====================

  /**
   * Get all clients with pagination, sorting, and optional status filter
   */
  getClients: (page = 1, search = '', ordering = '', status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    })
    if (ordering) {
      params.append('ordering', ordering)
    }
    if (status) {
      params.append('status', status)
    }
    return api.get<ClientListResponse>(`${SETTINGS_BASE_URL}/clients/?${params}`)
  },

  /**
   * Get client by ID
   */
  getClientById: (id: string) => {
    return api.get<Client>(`${SETTINGS_BASE_URL}/clients/${id}/`)
  },

  /**
   * Create new client
   */
  createClient: (data: CreateClientRequest) => {
    return api.post<Client>(`${SETTINGS_BASE_URL}/clients/`, data)
  },

  /**
   * Update client
   */
  updateClient: (id: string, data: UpdateClientRequest) => {
    return api.patch<Client>(`${SETTINGS_BASE_URL}/clients/${id}/`, data)
  },

  /**
   * Delete client
   */
  deleteClient: (id: string) => {
    return api.delete(`${SETTINGS_BASE_URL}/clients/${id}/`)
  },

  /**
   * Get clients count
   */
  getClientsCount: () => {
    return api.get<CountResponse>(`${SETTINGS_BASE_URL}/clients/count/`)
  },
}

