import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useProject, useUpdateProject } from '../hooks/useProjects'
import AssignmentsTab from '../components/AssignmentsTab'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { UpdateProjectRequest } from '@5data-hrms/shared'

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'assignments', label: 'Assignments' },
]

const BILLING_TYPES = [
  { value: 'time_and_material', label: 'Time & Material' },
  { value: 'fixed_price', label: 'Fixed Price' },
  { value: 'non_billable', label: 'Non-Billable' },
]

const PROJECT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState('details')
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true')

  const { data: project, isLoading, error } = useProject(id)
  const updateProject = useUpdateProject(id || '')

  // Check if user has admin role
  const isAdmin = user?.id ? true : false // TODO: Implement proper role checking
  const canEdit = isAdmin

  const [editData, setEditData] = useState<UpdateProjectRequest>({})

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await updateProject.mutateAsync(editData)
      setIsEditMode(false)
      setEditData({})
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Loading project details...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading project</p>
      </div>
    )
  }

  const getStatusBadgeColor = (projectStatus: string) => {
    switch (projectStatus) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBillingTypeLabel = (billingType: string) => {
    const found = BILLING_TYPES.find((bt) => bt.value === billingType)
    return found ? found.label : billingType
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-surface rounded-card transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
          <p className="text-text-secondary mt-1">{project.client}</p>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="card space-y-6">
        <div className="flex items-start justify-between">
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div>
              <p className="text-text-secondary text-sm">Billing Type</p>
              <p className="text-text-primary font-medium">{getBillingTypeLabel(project.billing_type)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Status</p>
              <p className="text-text-primary font-medium">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    project.status
                  )}`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Start Date</p>
              <p className="text-text-primary font-medium">
                {new Date(project.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">End Date</p>
              <p className="text-text-primary font-medium">
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="btn-primary whitespace-nowrap"
            >
              {isEditMode ? 'Cancel' : 'Edit Project'}
            </button>
          )}
        </div>

        {project.description && (
          <div className="border-t border-divider pt-6">
            <p className="text-text-secondary text-sm">Description</p>
            <p className="text-text-primary mt-2">{project.description}</p>
          </div>
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
          {activeTab === 'details' && (
            <div className="space-y-6">
              {isEditMode ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={editData.name ?? project.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Client
                      </label>
                      <input
                        type="text"
                        value={editData.client ?? project.client}
                        onChange={(e) => handleEditChange('client', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Billing Type
                      </label>
                      <select
                        value={editData.billing_type ?? project.billing_type}
                        onChange={(e) => handleEditChange('billing_type', e.target.value)}
                        className="input-field"
                      >
                        {BILLING_TYPES.map((bt) => (
                          <option key={bt.value} value={bt.value}>
                            {bt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Status
                      </label>
                      <select
                        value={editData.status ?? project.status}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className="input-field"
                      >
                        {PROJECT_STATUS.map((ps) => (
                          <option key={ps.value} value={ps.value}>
                            {ps.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editData.start_date ?? project.start_date}
                        onChange={(e) => handleEditChange('start_date', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editData.end_date ?? project.end_date ?? ''}
                        onChange={(e) => handleEditChange('end_date', e.target.value || null)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={editData.description ?? project.description ?? ''}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      rows={4}
                      className="input-field"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-divider">
                    <button
                      onClick={handleSave}
                      disabled={updateProject.isPending}
                      className="btn-primary"
                    >
                      {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false)
                        setEditData({})
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-text-secondary text-sm">Project Name</p>
                      <p className="text-text-primary font-medium mt-1">{project.name}</p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-sm">Client</p>
                      <p className="text-text-primary font-medium mt-1">{project.client}</p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-sm">Billing Type</p>
                      <p className="text-text-primary font-medium mt-1">
                        {getBillingTypeLabel(project.billing_type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-sm">Status</p>
                      <p className="text-text-primary font-medium mt-1">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            project.status
                          )}`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-sm">Start Date</p>
                      <p className="text-text-primary font-medium mt-1">
                        {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-sm">End Date</p>
                      <p className="text-text-primary font-medium mt-1">
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  {project.description && (
                    <div className="border-t border-divider pt-6">
                      <p className="text-text-secondary text-sm">Description</p>
                      <p className="text-text-primary mt-2">{project.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <AssignmentsTab projectId={project.id} canEdit={canEdit} />
          )}
        </div>
      </div>
    </div>
  )
}

