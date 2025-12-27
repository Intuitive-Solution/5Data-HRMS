import { useState } from 'react'
import type { EmployeeDetail, UpdateEmployeeRequest } from '@5data-hrms/shared'

interface PersonalInfoTabProps {
  employee: EmployeeDetail
  isEditMode: boolean
  onSave: (data: UpdateEmployeeRequest) => void
  canEdit: boolean
}

export default function PersonalInfoTab({
  employee,
  isEditMode,
  onSave,
  canEdit,
}: PersonalInfoTabProps) {
  const [formData, setFormData] = useState({
    employee_id: employee.employee_id || '',
    middle_name: employee.middle_name || '',
    personal_email: employee.personal_email || '',
    phone_number: employee.phone_number || '',
    gender: employee.gender || '',
    address: employee.address || '',
    date_of_birth: employee.date_of_birth || '',
    nationality: employee.nationality || '',
    picture: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, picture: e.target.files![0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      employee_id: formData.employee_id,
      middle_name: formData.middle_name,
      personal_email: formData.personal_email,
      phone_number: formData.phone_number,
      gender: (formData.gender as any) || undefined,
      address: formData.address,
      date_of_birth: formData.date_of_birth,
      nationality: formData.nationality,
      picture: formData.picture || undefined,
    })
  }

  if (isEditMode && canEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Employee ID
            </label>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              First Name
            </label>
            <input
              type="text"
              value={employee.user?.first_name}
              disabled
              className="input-field bg-surface opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Middle Name
            </label>
            <input
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={employee.user?.last_name}
              disabled
              className="input-field bg-surface opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email ID
            </label>
            <input
              type="email"
              value={employee.user?.email}
              disabled
              className="input-field bg-surface opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Personal Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Personal Email ID
            </label>
            <input
              type="email"
              name="personal_email"
              value={formData.personal_email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nationality
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Picture */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
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
        <p className="text-text-secondary text-sm">Employee ID</p>
        <p className="text-text-primary font-medium">{employee.employee_id}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">First Name</p>
        <p className="text-text-primary font-medium">{employee.user?.first_name}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Middle Name</p>
        <p className="text-text-primary font-medium">{employee.middle_name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Last Name</p>
        <p className="text-text-primary font-medium">{employee.user?.last_name}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Email ID</p>
        <p className="text-text-primary font-medium">{employee.user?.email}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Personal Email ID</p>
        <p className="text-text-primary font-medium">{employee.personal_email || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Phone Number</p>
        <p className="text-text-primary font-medium">{employee.phone_number || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Gender</p>
        <p className="text-text-primary font-medium">
          {employee.gender ? employee.gender.replace('_', ' ').toUpperCase() : 'N/A'}
        </p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Date of Birth</p>
        <p className="text-text-primary font-medium">
          {employee.date_of_birth
            ? new Date(employee.date_of_birth).toLocaleDateString()
            : 'N/A'}
        </p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Nationality</p>
        <p className="text-text-primary font-medium">{employee.nationality || 'N/A'}</p>
      </div>
      <div>
        <p className="text-text-secondary text-sm">Employment Status</p>
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
      <div className="col-span-2">
        <p className="text-text-secondary text-sm">Address</p>
        <p className="text-text-primary font-medium">{employee.address || 'N/A'}</p>
      </div>
    </div>
  )
}

