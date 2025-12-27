import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'

// Pages
import LoginPage from '@/modules/auth/pages/LoginPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'

export default function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

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
          {/* Additional routes will be added here */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  )
}

