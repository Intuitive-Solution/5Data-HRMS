import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth)

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
        <div className="card">
          <h3 className="text-text-secondary text-sm font-medium">Total Employees</h3>
          <p className="text-3xl font-bold text-primary mt-2">--</p>
        </div>
        <div className="card">
          <h3 className="text-text-secondary text-sm font-medium">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary mt-2">--</p>
        </div>
        <div className="card">
          <h3 className="text-text-secondary text-sm font-medium">Active Projects</h3>
          <p className="text-3xl font-bold text-primary mt-2">--</p>
        </div>
        <div className="card">
          <h3 className="text-text-secondary text-sm font-medium">Leave Balance</h3>
          <p className="text-3xl font-bold text-primary mt-2">--</p>
        </div>
      </div>
    </div>
  )
}



