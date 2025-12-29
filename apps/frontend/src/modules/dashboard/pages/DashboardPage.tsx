import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useActiveEmployeeCount } from '@/modules/employees/hooks/useEmployees'
import { useActiveProjectCount } from '@/modules/projects/hooks/useProjects'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { data: activeEmployeeCount, isLoading: isLoadingActiveCount } = useActiveEmployeeCount()
  const { data: activeProjectCount, isLoading: isLoadingActiveProjects } = useActiveProjectCount()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Welcome back, {user?.first_name}!
        </p>
      </div>

      {/* TODO: Add dashboard widgets and stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/employees')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/employees')
            }
          }}
        >
          <h3 className="text-text-secondary text-sm font-medium">Total Employees</h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {isLoadingActiveCount ? '...' : activeEmployeeCount ?? '--'}
          </p>
        </div>
        <div className="card">
          <h3 className="text-text-secondary text-sm font-medium">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary mt-2">--</p>
        </div>
        <div 
          className="card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/projects')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/projects')
            }
          }}
        >
          <h3 className="text-text-secondary text-sm font-medium">Active Projects</h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {isLoadingActiveProjects ? '...' : activeProjectCount ?? '--'}
          </p>
        </div>
        <div className="card">
          <h3 className="text-text-secondary text-sm font-medium">Leave Balance</h3>
          <p className="text-3xl font-bold text-primary mt-2">--</p>
        </div>
      </div>
    </div>
  )
}



