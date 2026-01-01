import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import {
  useHolidays,
  useHolidayYears,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from '../hooks/useSettings'
import type { Holiday, CreateHolidayRequest } from '@5data-hrms/shared'

export default function HolidaysPage() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('')
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState<CreateHolidayRequest>({
    name: '',
    date: '',
    is_optional: false,
  })
  const [formErrors, setFormErrors] = useState<{ name?: string; date?: string }>({})
  const [successMessage, setSuccessMessage] = useState('')

  const { data, isLoading, error } = useHolidays(page, search, ordering, selectedYear)
  const { data: yearsData } = useHolidayYears()

  // Generate year options (current year + next year + available years from API)
  const getYearOptions = () => {
    const years = new Set<number>()
    // Add current year and next year
    years.add(currentYear)
    years.add(currentYear + 1)
    // Add years from API
    if (yearsData) {
      yearsData.forEach((year) => years.add(year))
    }
    return Array.from(years).sort((a, b) => b - a)
  }

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
  const createHoliday = useCreateHoliday()
  const updateHoliday = useUpdateHoliday()
  const deleteHoliday = useDeleteHoliday()

  const openCreateModal = () => {
    setEditingHoliday(null)
    setFormData({ name: '', date: '', is_optional: false })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setFormData({
      name: holiday.name,
      date: holiday.date,
      is_optional: holiday.is_optional,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingHoliday(null)
    setFormData({ name: '', date: '', is_optional: false })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: { name?: string; date?: string } = {}
    if (!formData.name.trim()) {
      errors.name = 'Holiday name is required'
    }
    if (!formData.date) {
      errors.date = 'Date is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editingHoliday) {
        await updateHoliday.mutateAsync({
          id: editingHoliday.id,
          data: formData,
        })
        setSuccessMessage('Holiday updated successfully')
      } else {
        await createHoliday.mutateAsync(formData)
        setSuccessMessage('Holiday created successfully')
      }
      closeModal()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save holiday:', err)
    }
  }

  const handleDelete = async (holiday: Holiday) => {
    if (window.confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
      try {
        await deleteHoliday.mutateAsync(holiday.id)
        setSuccessMessage('Holiday deleted successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err) {
        console.error('Failed to delete holiday:', err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            aria-label="Back to settings"
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Holidays</h1>
            <p className="text-text-secondary mt-1">
              Manage company holidays
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Holiday
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Filters: Year Dropdown and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Year Dropdown */}
          <div className="flex items-center gap-3">
            <label htmlFor="year-filter" className="text-sm font-medium text-text-primary whitespace-nowrap">
              Year:
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 border border-divider rounded-lg bg-white text-text-primary outline-none focus:border-primary transition-colors cursor-pointer min-w-[120px]"
              aria-label="Filter by year"
            >
              {getYearOptions().map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-3 border border-divider rounded-lg px-4 py-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search holidays..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-text-secondary mt-4">Loading holidays...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading holidays</p>
          </div>
        ) : !data?.results || data.results.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No holidays found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-primary hover:underline"
            >
              Create your first holiday
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Date</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('date') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('date') && (
                        <span className="text-xs text-primary">{isSortedDesc('date') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('is_optional')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Type</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('is_optional') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('is_optional') && (
                        <span className="text-xs text-primary">{isSortedDesc('is_optional') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((holiday) => (
                  <tr
                    key={holiday.id}
                    className="border-b border-divider hover:bg-surface transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                      {holiday.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(holiday.date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          holiday.is_optional
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {holiday.is_optional ? 'Optional' : 'Mandatory'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(holiday)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                          aria-label={`Edit ${holiday.name}`}
                        >
                          <PencilIcon className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Delete ${holiday.name}`}
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
        )}
      </div>

      {/* Pagination */}
      {data && data.count > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.count)} of{' '}
            {data.count} holidays
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous}
              className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next}
              className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
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
                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.name ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                  placeholder="Enter holiday name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.date ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                />
                {formErrors.date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_optional"
                  checked={formData.is_optional}
                  onChange={(e) =>
                    setFormData({ ...formData, is_optional: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-divider text-primary focus:ring-primary"
                />
                <label
                  htmlFor="is_optional"
                  className="text-sm font-medium text-text-primary"
                >
                  Optional holiday (employees can choose to work)
                </label>
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
                  disabled={createHoliday.isPending || updateHoliday.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createHoliday.isPending || updateHoliday.isPending
                    ? 'Saving...'
                    : editingHoliday
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

