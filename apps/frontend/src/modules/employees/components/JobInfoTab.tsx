import { useState } from 'react'
import type { EmployeeDetail, UpdateEmployeeRequest } from '@5data-hrms/shared'
import ManagerSelect from './ManagerSelect'

interface JobInfoTabProps {
  employee: EmployeeDetail
  isEditMode: boolean
  onSave: (data: UpdateEmployeeRequest) => void
  canEdit: boolean
}

export default function JobInfoTab({
  employee,
  isEditMode,
  onSave,
  canEdit,
}: JobInfoTabProps) {
  const [formData, setFormData] = useState({
    job_title: employee.job_title || '',
    probation_policy: employee.probation_policy || '',
    reporting_manager: employee.reporting_manager?.id || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleManagerChange = (value: string) => {
    setFormData((prev) => ({ ...prev, reporting_manager: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      job_title: formData.job_title,
      probation_policy: formData.probation_policy,
      reporting_manager: formData.reporting_manager || undefined,
    })
  }

  if (isEditMode && canEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Job Title
            </label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          {/* Probation Policy */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Probation Policy
            </label>
            <input
              type="text"
              name="probation_policy"
              value={formData.probation_policy}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Reporting Manager */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Reporting Manager
            </label>
            <ManagerSelect
              value={formData.reporting_manager}
              onChange={handleManagerChange}
              excludeEmployeeId={employee.id}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className="text-text-secondary text-sm">Job Title</p>
        <p className="text-text-primary font-medium">{employee.job_title}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Probation Policy</p>
        <p className="text-text-primary font-medium">{employee.probation_policy || 'N/A'}</p>
      </div>
      <div className="col-span-2">
        <p className="text-text-secondary text-sm">Reporting Manager</p>
        <p className="text-text-primary font-medium">
          {employee.reporting_manager ? (
            <span>
              {employee.reporting_manager.user.first_name}{' '}
              {employee.reporting_manager.user.last_name}
              <span className="text-text-secondary text-sm ml-2">
                ({employee.reporting_manager.employee_id})
              </span>
            </span>
          ) : (
            'N/A'
          )}
        </p>
      </div>
    </div>
  )
}

