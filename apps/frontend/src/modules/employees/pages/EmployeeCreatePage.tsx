import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateEmployee } from '../hooks/useEmployees'
import type { CreateEmployeeRequest } from '@5data-hrms/shared'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function EmployeeCreatePage() {
  const navigate = useNavigate()
  const createEmployee = useCreateEmployee()

  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    email: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    job_title: '',
    department: '',
    employment_type: 'full_time',
    date_of_joining: '',
    middle_name: '',
    personal_email: '',
    phone_number: '',
    gender: undefined,
    address: '',
    date_of_birth: '',
    nationality: '',
    picture: undefined,
    probation_policy: '',
    reporting_manager_id: undefined,
    location: '',
    shift: '',
    contract_end_date: '',
    contractor_company: '',
    termination_date: '',
    termination_reason: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.files![0] }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required'
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required'
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.employment_type) newErrors.employment_type = 'Employment type is required'
    if (!formData.date_of_joining) newErrors.date_of_joining = 'Date of joining is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createEmployee.mutateAsync(formData)
      navigate('/employees')
    } catch (error) {
      console.error('Error creating employee:', error)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-surface rounded-card transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Create Employee</h1>
          <p className="text-text-secondary mt-1">Add a new employee to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-8">
        {/* Personal Info Section */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email ID *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender || ''}
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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'picture')}
                className="input-field"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Job Info Section */}
        <div className="border-t border-divider pt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Job Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className={`input-field ${errors.employee_id ? 'border-red-500' : ''}`}
              />
              {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className={`input-field ${errors.job_title ? 'border-red-500' : ''}`}
              />
              {errors.job_title && <p className="text-red-500 text-xs mt-1">{errors.job_title}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Reporting Manager
              </label>
              <input
                type="text"
                placeholder="TODO: Implement dropdown"
                disabled
                className="input-field bg-surface opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Work Info Section */}
        <div className="border-t border-divider pt-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Work Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`input-field ${errors.department ? 'border-red-500' : ''}`}
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Employment Type *
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className={`input-field ${errors.employment_type ? 'border-red-500' : ''}`}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
              {errors.employment_type && <p className="text-red-500 text-xs mt-1">{errors.employment_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date of Joining *
              </label>
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className={`input-field ${errors.date_of_joining ? 'border-red-500' : ''}`}
              />
              {errors.date_of_joining && (
                <p className="text-red-500 text-xs mt-1">{errors.date_of_joining}</p>
              )}
            </div>

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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Reason for Termination
              </label>
              <textarea
                name="termination_reason"
                value={formData.termination_reason}
                onChange={handleChange}
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-8 border-t border-divider">
          <button
            type="submit"
            disabled={createEmployee.isPending}
            className="btn-primary"
          >
            {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        {createEmployee.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-card">
            <p className="text-red-700 text-sm">Error creating employee. Please try again.</p>
          </div>
        )}
      </form>
    </div>
  )
}

