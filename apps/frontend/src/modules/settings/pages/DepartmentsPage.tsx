import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../hooks/useSettings'
import type { Department, CreateDepartmentRequest, EntityStatus } from '@5data-hrms/shared'
import { useFormValidation, type FieldRules } from '@/utils/validation'

const departmentValidationRules: FieldRules = {
  name: [
    { type: 'required', message: 'Department name is required' },
    { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
  ],
}

const initialFormData: CreateDepartmentRequest = {
  name: '',
  code: '',
  description: '',
  status: 'active' as EntityStatus,
}

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    data: formData,
    errors: formErrors,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setFormData,
    getFieldProps,
  } = useFormValidation<CreateDepartmentRequest>(initialFormData, departmentValidationRules)

  const { data, isLoading, error } = useDepartments(page, search, ordering)

  const handleSort = (field: string) => {
    setPage(1)
    if (ordering === field) {
      setOrdering(`-${field}`)
    } else if (ordering === `-${field}`) {
      setOrdering('')
    } else {
      setOrdering(field)
    }
  }

  const isSorted = (field: string) => {
    return ordering === field || ordering === `-${field}`
  }

  const isSortedDesc = (field: string) => {
    return ordering === `-${field}`
  }
  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment()
  const deleteDepartment = useDeleteDepartment()

  const openCreateModal = () => {
    setEditingDepartment(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code || '',
      description: department.description,
      status: department.status || 'active',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDepartment(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return

    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          data: formData,
        })
        setSuccessMessage('Department updated successfully')
      } else {
        await createDepartment.mutateAsync(formData)
        setSuccessMessage('Department created successfully')
      }
      closeModal()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save department:', err)
    }
  }

  const handleDelete = async (department: Department) => {
    if (window.confirm(`Are you sure you want to delete "${department.name}"?`)) {
      try {
        await deleteDepartment.mutateAsync(department.id)
        setSuccessMessage('Department deleted successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err) {
        console.error('Failed to delete department:', err)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-surface rounded-lg transition-colors mt-1"
            aria-label="Back to settings"
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Departments</h1>
            <p className="text-text-secondary mt-1 text-sm sm:text-base">
              Manage organization departments
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusIcon className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="flex items-center gap-3 border border-divider rounded-lg px-4 py-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-text-secondary mt-4">Loading departments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading departments</p>
          </div>
        ) : !data?.results || data.results.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No departments found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-primary hover:underline"
            >
              Create your first department
            </button>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {data.results.map((department) => (
                <div
                  key={department.id}
                  className="border border-divider rounded-xl p-4 bg-white hover:bg-surface transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {department.code && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface text-text-secondary">
                            {department.code}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            department.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-text-secondary'
                          }`}
                        >
                          {department.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-text-primary truncate">
                        {department.name}
                      </h3>
                      {department.description && (
                        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                          {department.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(department)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        aria-label={`Edit ${department.name}`}
                      >
                        <PencilIcon className="w-5 h-5 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(department)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${department.name}`}
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-text-secondary">
                    Created: {new Date(department.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block table-container">
              <table className="table-sticky-col">
                <thead>
                  <tr className="border-b border-divider bg-surface">
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('name') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                        {isSorted('name') && (
                          <span className="text-xs text-primary">{isSortedDesc('name') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Code</span>
                        <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('code') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                        {isSorted('code') && (
                          <span className="text-xs text-primary">{isSortedDesc('code') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Description
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Status</span>
                        <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('status') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                        {isSorted('status') && (
                          <span className="text-xs text-primary">{isSortedDesc('status') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Created</span>
                        <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('created_at') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                        {isSorted('created_at') && (
                          <span className="text-xs text-primary">{isSortedDesc('created_at') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((department) => (
                    <tr
                      key={department.id}
                      className="border-b border-divider hover:bg-surface transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-text-primary font-medium">
                        {department.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {department.code || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {department.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            department.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {department.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(department.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(department)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label={`Edit ${department.name}`}
                          >
                            <PencilIcon className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(department)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${department.name}`}
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.count > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.count)} of{' '}
            {data.count} departments
          </p>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous}
              className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors flex-1 sm:flex-none"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next}
              className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors flex-1 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-divider">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingDepartment ? 'Edit Department' : 'Add Department'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  {...getFieldProps('name')}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.name ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                  placeholder="Enter department name"
                />
                {formErrors.name && (
                  <p id="name-error" role="alert" className="mt-1 text-sm text-red-500">
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={formData.code || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors"
                  placeholder="Enter department code (optional)"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Enter department description (optional)"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value as EntityStatus)}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-divider rounded-lg hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDepartment.isPending || updateDepartment.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createDepartment.isPending || updateDepartment.isPending
                    ? 'Saving...'
                    : editingDepartment
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

