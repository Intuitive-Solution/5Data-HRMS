import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { API_URL, STORAGE_KEYS } from '@5data-hrms/shared'
import type { AuthTokens } from '@5data-hrms/shared'

let store: any // Will be set after store is created

export const setStore = (reduxStore: any) => {
  store = reduxStore
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })

          const tokens: AuthTokens = response.data
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh)

          // Update Redux store if available
          if (store) {
            store.dispatch({ type: 'auth/refreshTokenSuccess', payload: tokens })
          }

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Clear auth and redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (store) {
          store.dispatch({ type: 'auth/logout' })
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api



