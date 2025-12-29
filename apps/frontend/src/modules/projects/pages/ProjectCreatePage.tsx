import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProject } from '../hooks/useProjects'
import type { CreateProjectRequest } from '@5data-hrms/shared'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const BILLING_TYPES = [
  { value: 'time_and_material', label: 'Time & Material' },
  { value: 'fixed_price', label: 'Fixed Price' },
  { value: 'non_billable', label: 'Non-Billable' },
]

export default function ProjectCreatePage() {
  const navigate = useNavigate()
  const createProject = useCreateProject()

  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    client: '',
    billing_type: 'time_and_material',
    start_date: '',
    end_date: '',
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.client.trim()) newErrors.client = 'Client name is required'
    if (!formData.billing_type) newErrors.billing_type = 'Billing type is required'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'

    // Validate end_date is after start_date if provided
    if (formData.end_date && formData.start_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createProject.mutateAsync(formData)
      navigate('/projects')
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-surface rounded-card transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Create Project</h1>
          <p className="text-text-secondary mt-1">Add a new project to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-8">
        {/* Project Info Section */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Project Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="Enter client name"
                className={`input-field ${errors.client ? 'border-red-500' : ''}`}
              />
              {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Billing Type *
              </label>
              <select
                name="billing_type"
                value={formData.billing_type}
                onChange={handleChange}
                className={`input-field ${errors.billing_type ? 'border-red-500' : ''}`}
              >
                {BILLING_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
              {errors.billing_type && (
                <p className="text-red-500 text-xs mt-1">{errors.billing_type}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dates Section */}
        <div className="border-t border-divider pt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Project Duration</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`input-field ${errors.start_date ? 'border-red-500' : ''}`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`input-field ${errors.end_date ? 'border-red-500' : ''}`}
              />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="border-t border-divider pt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Additional Details</h2>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description (optional)"
              rows={4}
              className="input-field"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-8 border-t border-divider">
          <button
            type="submit"
            disabled={createProject.isPending}
            className="btn-primary"
          >
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        {createProject.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-card">
            <p className="text-red-700 text-sm">Error creating project. Please try again.</p>
          </div>
        )}
      </form>
    </div>
  )
}

