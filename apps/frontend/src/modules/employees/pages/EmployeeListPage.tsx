import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

import * as XLSX from 'xlsx'
import { useCreateEmployee } from "../hooks/useEmployees"
import { exportEmployeesToExcel } from '@/utils/exportEmployees'
import {importEmployeesFromExcel} from '@/utils/importEmployeesFromExcel'



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

  //Export Handler
  const handleExport = () => {
  if (!data?.results?.length) return
  exportEmployeesToExcel(data.results)
}


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

  const createEmployeeMutation = useCreateEmployee()

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('FILE SELECTED:', file.name)
    // Step 1: Read file
    const buffer = await file.arrayBuffer()

    // Step 2: Parse Excel
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    // Step 3: Convert to JSON
    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
    })
    console.log('PARSED ROWS:', rows)
    // Step 4: Import rows
    await importEmployeesFromExcel(rows, createEmployeeMutation)

    // Reset input
    e.target.value = ''
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Employees</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Manage employee information and documents
          </p>
        </div>
      {isHROrAdmin && (
  <div className="flex flex-wrap items-center gap-3">
    {/* File Input */}
      <label 
        htmlFor="file-upload" 
        className="btn-secondary flex items-center justify-center gap-2 cursor-pointer"
      >
        Import Employees
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>


      {/* <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      /> */}


    {/* Export Button */}
    <button
      onClick={handleExport}
      className="btn-secondary flex items-center justify-center gap-2"
      disabled={!data?.results?.length}
    >
      Export
    </button>

    {/* Add Employee Button */}
    <button
      onClick={handleCreateNew}
      className="btn-primary flex items-center justify-center gap-2"
    >
      <PlusIcon className="w-5 h-5" />
      Add Employee
    </button>
  </div>
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
            className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary min-w-0"
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
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {data.results.map((employee: Employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleView(employee.id)}
                  className="border border-divider rounded-xl p-4 bg-white hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {employee.picture ? (
                      <img
                        src={employee.picture}
                        alt={`${employee.user?.first_name} ${employee.user?.last_name}`}
                        className="w-12 h-12 rounded-full object-cover border border-divider flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {employee.user?.first_name?.charAt(0)}{employee.user?.last_name?.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface text-text-secondary">
                          {employee.employee_id}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            employee.employment_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : employee.employment_status === 'terminated'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {employee.employment_status}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-text-primary truncate">
                        {employee.user?.first_name} {employee.user?.last_name}
                      </h3>
                      <p className="mt-1 text-sm text-text-secondary truncate">
                        {employee.job_title}
                      </p>
                      {employee.department && (
                        <p className="text-xs text-text-secondary mt-1">
                          {employee.department.name}
                        </p>
                      )}
                    </div>
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current[employee.id] = el
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMenuClick(employee.id, buttonRefs.current[employee.id])
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                      title="More options"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-text-secondary" />
                    </button>
                  </div>
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
                      onClick={() => handleView(employee.id)}
                      className="border-b border-divider hover:bg-surface transition-colors cursor-pointer"
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {employee.user?.first_name?.charAt(0)}{employee.user?.last_name?.charAt(0)}
                            </div>
                          )}
                          <span>{employee.user?.first_name} {employee.user?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {employee.department?.name || '-'}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMenuClick(employee.id, buttonRefs.current[employee.id])
                            }}
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
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.count > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.count)} of{' '}
            {data.count} employees
          </p>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous}
              className="px-4 py-2 border border-divider rounded-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors flex-1 sm:flex-none"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next}
              className="px-4 py-2 border border-divider rounded-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors flex-1 sm:flex-none"
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

