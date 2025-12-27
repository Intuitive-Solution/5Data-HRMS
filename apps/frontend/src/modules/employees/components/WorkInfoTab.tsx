import { useState } from 'react'
import type { EmployeeDetail, UpdateEmployeeRequest } from '@5data-hrms/shared'

interface WorkInfoTabProps {
  employee: EmployeeDetail
  isEditMode: boolean
  onSave: (data: UpdateEmployeeRequest) => void
  canEdit: boolean
}

export default function WorkInfoTab({
  employee,
  isEditMode,
  onSave,
  canEdit,
}: WorkInfoTabProps) {
  const [formData, setFormData] = useState({
    department: employee.department || '',
    location: employee.location || '',
    shift: employee.shift || '',
    employment_type: employee.employment_type || '',
    contract_end_date: employee.contract_end_date || '',
    contractor_company: employee.contractor_company || '',
    termination_date: employee.termination_date || '',
    termination_reason: employee.termination_reason || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      department: formData.department,
      location: formData.location,
      shift: formData.shift,
      employment_type: (formData.employment_type as any),
      contract_end_date: formData.contract_end_date || undefined,
      contractor_company: formData.contractor_company,
      termination_date: formData.termination_date || undefined,
      termination_reason: formData.termination_reason,
    })
  }

  if (isEditMode && canEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Shift
            </label>
            <input
              type="text"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Employment Type
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select Type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>

          {/* Contract End Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Contract End Date
            </label>
            <input
              type="date"
              name="contract_end_date"
              value={formData.contract_end_date}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Contractor Company */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Contractor Company
            </label>
            <input
              type="text"
              name="contractor_company"
              value={formData.contractor_company}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Termination Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Termination Date
            </label>
            <input
              type="date"
              name="termination_date"
              value={formData.termination_date}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Termination Reason */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Reason for Termination
          </label>
          <textarea
            name="termination_reason"
            value={formData.termination_reason}
            onChange={handleChange}
            rows={4}
            className="input-field"
          />
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
        <p className="text-text-secondary text-sm">Department</p>
        <p className="text-text-primary font-medium">{employee.department}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Location</p>
        <p className="text-text-primary font-medium">{employee.location || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Shift</p>
        <p className="text-text-primary font-medium">{employee.shift || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Employment Type</p>
        <p className="text-text-primary font-medium">
          {employee.employment_type.replace('_', ' ').toUpperCase()}
        </p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Date of Joining</p>
        <p className="text-text-primary font-medium">
          {new Date(employee.date_of_joining).toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Contract End Date</p>
        <p className="text-text-primary font-medium">
          {employee.contract_end_date
            ? new Date(employee.contract_end_date).toLocaleDateString()
            : 'N/A'}
        </p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Contractor Company</p>
        <p className="text-text-primary font-medium">{employee.contractor_company || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Termination Date</p>
        <p className="text-text-primary font-medium">
          {employee.termination_date
            ? new Date(employee.termination_date).toLocaleDateString()
            : 'N/A'}
        </p>
      </div>
      <div className="col-span-2">
        <p className="text-text-secondary text-sm">Reason for Termination</p>
        <p className="text-text-primary font-medium">{employee.termination_reason || 'N/A'}</p>
      </div>
    </div>
  )
}

