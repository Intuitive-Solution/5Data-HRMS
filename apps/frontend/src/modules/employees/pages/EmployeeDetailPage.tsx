import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useEmployee, useUpdateEmployee } from '../hooks/useEmployees'
import PersonalInfoTab from '../components/PersonalInfoTab'
import JobInfoTab from '../components/JobInfoTab'
import WorkInfoTab from '../components/WorkInfoTab'
import DocumentsTab from '../components/DocumentsTab'
import RolesTab from '../components/RolesTab'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const TABS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'job', label: 'Job Info' },
  { id: 'work', label: 'Work Info' },
  { id: 'roles', label: 'Roles' },
  { id: 'documents', label: 'Documents' },
]

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState('personal')
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true')

  const { data: employee, isLoading, error } = useEmployee(id)
  const updateEmployee = useUpdateEmployee(id || '')

  // Check if user has HR/Admin role
  const isHROrAdmin = user?.id ? true : false // TODO: Implement proper role checking
  const canEdit = isHROrAdmin || user?.id === employee?.user?.id

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Loading employee details...</p>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading employee</p>
      </div>
    )
  }

  const handleSave = async (data: any) => {
    try {
      await updateEmployee.mutateAsync(data)
      setIsEditMode(false)
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-surface rounded-card transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {employee.user?.first_name} {employee.user?.last_name}
          </h1>
          <p className="text-text-secondary mt-1">{employee.employee_id}</p>
        </div>
      </div>

      {/* Employee Profile Card */}
      <div className="card flex items-center gap-8">
        <div className="flex-shrink-0">
          {employee.picture ? (
            <img
              src={employee.picture}
              alt={`${employee.user?.first_name} ${employee.user?.last_name}`}
              className="w-24 h-24 rounded-card object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-card bg-surface flex items-center justify-center">
              <span className="text-2xl font-semibold text-text-secondary">
                {employee.user?.first_name[0]}{employee.user?.last_name[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-secondary text-sm">Email</p>
              <p className="text-text-primary font-medium">{employee.user?.email}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Status</p>
              <p className="text-text-primary font-medium">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    employee.employment_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : employee.employment_status === 'terminated'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {employee.employment_status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Department</p>
              <p className="text-text-primary font-medium">{employee.department?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Date of Joining</p>
              <p className="text-text-primary font-medium">
                {new Date(employee.date_of_joining).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="btn-primary whitespace-nowrap"
          >
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b border-divider overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalInfoTab
              employee={employee}
              isEditMode={isEditMode}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}
          {activeTab === 'job' && (
            <JobInfoTab
              employee={employee}
              isEditMode={isEditMode}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}
          {activeTab === 'work' && (
            <WorkInfoTab
              employee={employee}
              isEditMode={isEditMode}
              onSave={handleSave}
              canEdit={canEdit}
            />
          )}
          {activeTab === 'roles' && (
            <RolesTab employeeUserId={employee.user?.id} isEditable={canEdit} />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab employee={employee} canEdit={canEdit} />
          )}
        </div>
      </div>
    </div>
  )
}

