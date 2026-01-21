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
import { useProjects, useDeleteProject } from '../hooks/useProjects'
import type { Project } from '@5data-hrms/shared'

import { exportProjectAssignmentsToExcel } from '@/utils/exportProjectAssignments'
import * as XLSX from 'xlsx'
import { importProjectsFromExcel } from '@/utils/importProjectsFromExcel'
import { useCreateProject } from '../hooks/useProjects'


export default function ProjectListPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('name')
  const [status, setStatus] = useState('')
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

  const { data, isLoading, error } = useProjects(page, search, ordering, status)
  const deleteProject = useDeleteProject()

  // Check if user has admin role
  const isAdmin = user?.id ? true : false // TODO: Implement proper role checking

  const handleView = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const handleEdit = (projectId: string) => {
    navigate(`/projects/${projectId}?edit=true`)
  }

  const handleDelete = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(projectId)
    }
  }

  const handleCreateNew = () => {
    navigate('/projects/new')
  }

  const handleMenuClick = (projectId: string, buttonRef: HTMLButtonElement | null) => {
    if (openMenuId === projectId) {
      setOpenMenuId(null)
    } else {
      setOpenMenuId(projectId)
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect()
        setMenuPosition({
          top: rect.bottom + 8,
          left: rect.left - 160,
        })
      }
    }
  }

  const handleSort = (field: string) => {
    setPage(1)
    if (ordering === field) {
      setOrdering(`-${field}`)
    } else if (ordering === `-${field}`) {
      setOrdering(field)
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

  const getStatusBadgeColor = (projectStatus: string) => {
    switch (projectStatus) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBillingTypeLabel = (billingType: string) => {
    switch (billingType) {
      case 'time_and_material':
        return 'Time & Material'
      case 'fixed_price':
        return 'Fixed Price'
      case 'non_billable':
        return 'Non-Billable'
      default:
        return billingType
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading projects</p>
      </div>
    )
  }

  const createProjectMutation = useCreateProject()

const handleProjectFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  console.log('PROJECT FILE SELECTED:', file.name)

  const buffer = await file.arrayBuffer()

  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
  })

  console.log('PARSED PROJECT ROWS:', rows)

  await importProjectsFromExcel(rows, createProjectMutation)

  e.target.value = ''
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Manage projects and assignments
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-3 w-full sm:w-auto">

        <label
          htmlFor="project-upload"
          className="btn-secondary cursor-pointer"
        >
          Import Projects
          <input
            id="project-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleProjectFileChange}
            className="hidden"
          />
        </label>

            <button
              onClick={() => exportProjectAssignmentsToExcel()}
              className="btn-secondary"
            >
              Export
            </button>

          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            Add Project
          </button>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 border border-divider rounded-card px-4 py-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary min-w-0"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="status-filter" className="text-sm font-medium text-text-primary">Status:</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="input-field flex-1 sm:max-w-xs"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading projects...</p>
          </div>
        ) : !data?.results || data.results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No projects found</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {data.results.map((project: Project) => (
                <div
                  key={project.id}
                  onClick={() => handleView(project.id)}
                  className="border border-divider rounded-xl p-4 bg-white hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadgeColor(
                            project.status
                          )}`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {getBillingTypeLabel(project.billing_type)}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-text-primary truncate">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-sm text-text-secondary truncate">
                        {project.client}
                      </p>
                    </div>
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current[project.id] = el
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMenuClick(project.id, buttonRefs.current[project.id])
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                      title="More options"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-text-secondary" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                    {project.end_date && (
                      <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                    )}
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
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <ChevronUpDownIcon
                          className={`w-4 h-4 ${isSorted('name') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`}
                        />
                        {isSorted('name') && (
                          <span className="text-xs">{isSortedDesc('name') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('client')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Client</span>
                        <ChevronUpDownIcon
                          className={`w-4 h-4 ${isSorted('client') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`}
                        />
                        {isSorted('client') && (
                          <span className="text-xs">{isSortedDesc('client') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Billing Type
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Status</span>
                        <ChevronUpDownIcon
                          className={`w-4 h-4 ${isSorted('status') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`}
                        />
                        {isSorted('status') && (
                          <span className="text-xs">{isSortedDesc('status') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Start Date</span>
                        <ChevronUpDownIcon
                          className={`w-4 h-4 ${isSorted('start_date') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`}
                        />
                        {isSorted('start_date') && (
                          <span className="text-xs">{isSortedDesc('start_date') ? '↓' : '↑'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((project: Project) => (
                    <tr
                      key={project.id}
                      onClick={() => handleView(project.id)}
                      className="border-b border-divider hover:bg-surface transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-text-primary font-medium">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {project.client}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {getBillingTypeLabel(project.billing_type)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            project.status
                          )}`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(project.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {project.end_date
                          ? new Date(project.end_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <button
                            ref={(el) => {
                              if (el) buttonRefs.current[project.id] = el
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMenuClick(project.id, buttonRefs.current[project.id])
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
            {data.count} projects
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
          {isAdmin && (
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

