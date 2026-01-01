import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { loginSuccess } from '@/store/slices/authSlice'
import { STORAGE_KEYS } from '@5data-hrms/shared'
import type { AuthUser, AuthTokens } from '@5data-hrms/shared'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'

// Pages
import LoginPage from '@/modules/auth/pages/LoginPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import EmployeeListPage from '@/modules/employees/pages/EmployeeListPage'
import EmployeeDetailPage from '@/modules/employees/pages/EmployeeDetailPage'
import EmployeeCreatePage from '@/modules/employees/pages/EmployeeCreatePage'
import ProjectListPage from '@/modules/projects/pages/ProjectListPage'
import ProjectDetailPage from '@/modules/projects/pages/ProjectDetailPage'
import ProjectCreatePage from '@/modules/projects/pages/ProjectCreatePage'
import TimesheetListPage from '@/modules/timesheets/pages/TimesheetListPage'
import TimesheetPage from '@/modules/timesheets/pages/TimesheetPage'
import TeamTimesheetsPage from '@/modules/timesheets/pages/TeamTimesheetsPage'
import LeaveListPage from '@/modules/leaves/pages/LeaveListPage'
import SettingsDashboard from '@/modules/settings/pages/SettingsDashboard'
import DepartmentsPage from '@/modules/settings/pages/DepartmentsPage'
import LocationsPage from '@/modules/settings/pages/LocationsPage'
import HolidaysPage from '@/modules/settings/pages/HolidaysPage'

export default function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [isInitialized, setIsInitialized] = useState(false)

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const userJson = localStorage.getItem(STORAGE_KEYS.USER)

    if (accessToken && refreshToken && userJson) {
      try {
        const user: AuthUser = JSON.parse(userJson)
        const tokens: AuthTokens = {
          access: accessToken,
          refresh: refreshToken,
        }
        dispatch(loginSuccess({ user, tokens }))
      } catch (error) {
        console.error('Failed to restore authentication state:', error)
        // Clear corrupted localStorage data
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
    // Mark initialization as complete
    setIsInitialized(true)
  }, [dispatch])

  // Show loading screen while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* Employee Routes */}
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/employees/new" element={<EmployeeCreatePage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />

          {/* Project Routes */}
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new" element={<ProjectCreatePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Timesheet Routes */}
          <Route path="/timesheets" element={<TimesheetListPage />} />
          <Route path="/timesheets/new" element={<TimesheetPage />} />
          <Route path="/timesheets/:id" element={<TimesheetPage />} />
          <Route path="/timesheets/team" element={<TeamTimesheetsPage />} />

          {/* Leave Routes */}
          <Route path="/leaves" element={<LeaveListPage />} />

          {/* Settings Routes */}
          <Route path="/settings" element={<SettingsDashboard />} />
          <Route path="/settings/departments" element={<DepartmentsPage />} />
          <Route path="/settings/locations" element={<LocationsPage />} />
          <Route path="/settings/holidays" element={<HolidaysPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  )
}

