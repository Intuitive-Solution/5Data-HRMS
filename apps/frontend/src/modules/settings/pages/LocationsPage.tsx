import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '../hooks/useSettings'
import type { Location, CreateLocationRequest, EntityStatus } from '@5data-hrms/shared'
import { useFormValidation, type FieldRules } from '@/utils/validation'

const locationValidationRules: FieldRules = {
  name: [
    { type: 'required', message: 'Location name is required' },
    { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
  ],
}

const initialFormData: CreateLocationRequest = {
  name: '',
  code: '',
  address: '',
  status: 'active' as EntityStatus,
}

export default function LocationsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
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
  } = useFormValidation<CreateLocationRequest>(initialFormData, locationValidationRules)

  const { data, isLoading, error } = useLocations(page, search, ordering)

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
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const deleteLocation = useDeleteLocation()

  const openCreateModal = () => {
    setEditingLocation(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      code: location.code || '',
      address: location.address,
      status: location.status || 'active',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLocation(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return

    try {
      if (editingLocation) {
        await updateLocation.mutateAsync({
          id: editingLocation.id,
          data: formData,
        })
        setSuccessMessage('Location updated successfully')
      } else {
        await createLocation.mutateAsync(formData)
        setSuccessMessage('Location created successfully')
      }
      closeModal()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save location:', err)
    }
  }

  const handleDelete = async (location: Location) => {
    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      try {
        await deleteLocation.mutateAsync(location.id)
        setSuccessMessage('Location deleted successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err) {
        console.error('Failed to delete location:', err)
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
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Locations</h1>
            <p className="text-text-secondary mt-1 text-sm sm:text-base">
              Manage office locations
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusIcon className="w-5 h-5" />
          Add Location
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
            placeholder="Search locations..."
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
            <p className="text-text-secondary mt-4">Loading locations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading locations</p>
          </div>
        ) : !data?.results || data.results.length === 0 ? (
          <div className="text-center py-12">
            <MapPinIcon className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No locations found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-primary hover:underline"
            >
              Create your first location
            </button>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {data.results.map((location) => (
                <div
                  key={location.id}
                  className="border border-divider rounded-xl p-4 bg-white hover:bg-surface transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {location.code && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface text-text-secondary">
                            {location.code}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            location.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-text-secondary'
                          }`}
                        >
                          {location.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-text-primary truncate">
                        {location.name}
                      </h3>
                      {location.address && (
                        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                          {location.address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(location)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        aria-label={`Edit ${location.name}`}
                      >
                        <PencilIcon className="w-5 h-5 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(location)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${location.name}`}
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-text-secondary">
                    Created: {new Date(location.created_at).toLocaleDateString()}
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
                      Address
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
                  {data.results.map((location) => (
                    <tr
                      key={location.id}
                      className="border-b border-divider hover:bg-surface transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-text-primary font-medium">
                        {location.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {location.code || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {location.address || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            location.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {location.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(location.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(location)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label={`Edit ${location.name}`}
                          >
                            <PencilIcon className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(location)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${location.name}`}
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
            {data.count} locations
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-divider">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingLocation ? 'Edit Location' : 'Add Location'}
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
                  placeholder="Enter location name"
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
                  placeholder="Enter location code (optional)"
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Enter location address (optional)"
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
                  disabled={createLocation.isPending || updateLocation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLocation.isPending || updateLocation.isPending
                    ? 'Saving...'
                    : editingLocation
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

