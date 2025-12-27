import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployees'
import type { Employee } from '@5data-hrms/shared'

export default function EmployeeListPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('employee_id')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

  const { data, isLoading, error } = useEmployees(page, search, ordering)
  const deleteEmployee = useDeleteEmployee()

  // Check if user has HR/Admin role
  const isHROrAdmin = user?.id ? true : false // TODO: Implement proper role checking

  const handleView = (employeeId: string) => {
    navigate(`/employees/${employeeId}`)
  }

  const handleEdit = (employeeId: string) => {
    navigate(`/employees/${employeeId}?edit=true`)
  }

  const handleDelete = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee.mutate(employeeId)
    }
  }

  const handleCreateNew = () => {
    navigate('/employees/new')
  }

  const handleMenuClick = (employeeId: string, buttonRef: HTMLButtonElement | null) => {
    if (openMenuId === employeeId) {
      setOpenMenuId(null)
    } else {
      setOpenMenuId(employeeId)
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect()
        setMenuPosition({
          top: rect.bottom + 8,
          left: rect.left - 160, // w-40 = 160px, align right
        })
      }
    }
  }

  const handleSort = (field: string) => {
    setPage(1) // Reset to page 1 when sorting
    if (ordering === field) {
      // If clicking same field, reverse the order
      setOrdering(`-${field}`)
    } else if (ordering === `-${field}`) {
      // If clicking descending field, go back to ascending
      setOrdering(field)
    } else {
      // Click a new field
      setOrdering(field)
    }
  }

  const isSorted = (field: string) => {
    return ordering === field || ordering === `-${field}`
  }

  const isSortedDesc = (field: string) => {
    return ordering === `-${field}`
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading employees</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Employees</h1>
          <p className="text-text-secondary mt-2">
            Manage employee information and documents
          </p>
        </div>
        {isHROrAdmin && (
          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-3 border border-divider rounded-card px-4 py-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
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
            <p className="text-text-secondary">Loading employees...</p>
          </div>
        ) : !data?.results || data.results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider bg-surface">
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('employee_id')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Employee ID</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('employee_id') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('employee_id') && (
                        <span className="text-xs">{isSortedDesc('employee_id') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('user__first_name')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('user__first_name') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('user__first_name') && (
                        <span className="text-xs">{isSortedDesc('user__first_name') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Department</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('department') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('department') && (
                        <span className="text-xs">{isSortedDesc('department') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('job_title')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Job Title</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('job_title') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('job_title') && (
                        <span className="text-xs">{isSortedDesc('job_title') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('employment_status')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                      <ChevronUpDownIcon className={`w-4 h-4 ${isSorted('employment_status') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`} />
                      {isSorted('employment_status') && (
                        <span className="text-xs">{isSortedDesc('employment_status') ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((employee: Employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-divider hover:bg-surface transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                      {employee.employee_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      <div className="flex items-center gap-3">
                        {employee.picture ? (
                          <img
                            src={employee.picture}
                            alt={`${employee.user?.first_name} ${employee.user?.last_name}`}
                            className="w-10 h-10 rounded-full object-cover border border-divider flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {employee.user?.first_name?.charAt(0)}{employee.user?.last_name?.charAt(0)}
                          </div>
                        )}
                        <span>{employee.user?.first_name} {employee.user?.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {employee.job_title}
                    </td>
                    <td className="px-6 py-4 text-sm">
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
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <button
                          ref={(el) => {
                            if (el) buttonRefs.current[employee.id] = el
                          }}
                          onClick={() => handleMenuClick(employee.id, buttonRefs.current[employee.id])}
                          className="p-2 hover:bg-surface rounded-card transition-colors"
                          title="More options"
                        >
                          <EllipsisVerticalIcon className="w-5 h-5 text-text-secondary" />
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
            {data.count} employees
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous}
              className="px-4 py-2 border border-divider rounded-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next}
              className="px-4 py-2 border border-divider rounded-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Fixed Position Dropdown Menu */}
      {openMenuId && menuPosition && (
        <div
          ref={menuRef}
          className="fixed w-40 bg-white border border-divider rounded-lg shadow-xl z-50"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <button
            onClick={() => {
              handleView(openMenuId)
              setOpenMenuId(null)
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-text-primary"
          >
            <EyeIcon className="w-4 h-4 text-primary" />
            <span className="text-sm">View</span>
          </button>
          {isHROrAdmin && (
            <>
              <button
                onClick={() => {
                  handleEdit(openMenuId)
                  setOpenMenuId(null)
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-text-primary border-t border-divider"
              >
                <PencilIcon className="w-4 h-4 text-primary" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => {
                  handleDelete(openMenuId)
                  setOpenMenuId(null)
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 border-t border-divider"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm">Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

