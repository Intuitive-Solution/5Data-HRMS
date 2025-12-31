import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PencilIcon,
} from '@heroicons/react/24/outline' // EyeIcon still needed for dropdown menu
import { useMyTimesheets, useDeleteTimesheet } from '../hooks/useTimesheets'
import { timesheetApi } from '../services/timesheetApi'
import type { Timesheet } from '@5data-hrms/shared'

// Calculate month-bounded weeks (same logic as backend and TimesheetPage)
const getMonthWeeks = (year: number, month: number): { start: string; end: string }[] => {
  const weeks: { start: string; end: string }[] = []
  
  // Get first and last day of month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  let currentDate = new Date(firstDay)
  let weekCount = 0
  
  // Build weeks 1-4
  while (currentDate <= lastDay && weekCount < 4) {
    weekCount++
    
    // Calculate days until Saturday
    // JavaScript getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const dayOfWeek = currentDate.getDay()
    let daysUntilSaturday = (6 - dayOfWeek)
    if (daysUntilSaturday < 0) {
      daysUntilSaturday += 7
    }
    
    const weekEnd = new Date(currentDate)
    weekEnd.setDate(weekEnd.getDate() + daysUntilSaturday)
    
    // Cap to end of month
    const actualEnd = weekEnd > lastDay ? lastDay : weekEnd
    
    // Format dates as YYYY-MM-DD without timezone issues
    const startStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const endStr = `${actualEnd.getFullYear()}-${String(actualEnd.getMonth() + 1).padStart(2, '0')}-${String(actualEnd.getDate()).padStart(2, '0')}`
    
    weeks.push({
      start: startStr,
      end: endStr
    })
    
    // Move to next Sunday
    currentDate = new Date(actualEnd)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Week 5: if there are remaining days after Week 4
  if (currentDate <= lastDay) {
    // Calculate days until Saturday for Week 5
    const dayOfWeek = currentDate.getDay()
    let daysUntilSaturday = (6 - dayOfWeek)
    if (daysUntilSaturday < 0) {
      daysUntilSaturday += 7
    }
    
    const week5End = new Date(currentDate)
    week5End.setDate(week5End.getDate() + daysUntilSaturday)
    
    // Cap to end of month
    const actualWeek5End = week5End > lastDay ? lastDay : week5End
    
    const startStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const endStr = `${actualWeek5End.getFullYear()}-${String(actualWeek5End.getMonth() + 1).padStart(2, '0')}-${String(actualWeek5End.getDate()).padStart(2, '0')}`
    
    weeks.push({
      start: startStr,
      end: endStr
    })
    
    // Week 6: if there are remaining days after Week 5
    const nextDate = new Date(actualWeek5End)
    nextDate.setDate(nextDate.getDate() + 1)
    
    if (nextDate <= lastDay) {
      const week6StartStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
      const week6EndStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`
      
      weeks.push({
        start: week6StartStr,
        end: week6EndStr
      })
    }
  }
  
  return weeks
}

export default function TimesheetListPage() {
  const navigate = useNavigate()
  const { data: timesheets = [], isLoading, error } = useMyTimesheets()
  const deleteTimesheet = useDeleteTimesheet()
  const [isCheckingTimesheet, setIsCheckingTimesheet] = useState(false)
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleCreateNew = async () => {
    setIsCheckingTimesheet(true)
    try {
      // Get current date and its month-bounded week
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth()
      
      // Get all weeks for the current month
      const monthWeeks = getMonthWeeks(year, month)
      
      // Find which week today falls into
      let currentWeekStart = ''
      let currentWeekEnd = ''
      
      for (const week of monthWeeks) {
        const weekStartDate = new Date(week.start)
        const weekEndDate = new Date(week.end)
        
        // Create a normalized today date for comparison (without time)
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        
        // Check if today falls within this week
        if (todayDate >= weekStartDate && todayDate <= weekEndDate) {
          currentWeekStart = week.start
          currentWeekEnd = week.end
          break
        }
      }
      
      console.log('Looking for timesheet for current week:', JSON.stringify({ currentWeekStart, currentWeekEnd }))
      console.log('Available timesheets:', JSON.stringify(timesheets.map(ts => ({ 
        id: ts.id, 
        week_start: ts.week_start, 
        week_end: ts.week_end 
      }))))
      
      // Check if timesheet already exists for current week
      const existingTimesheet = timesheets.find(
        ts => ts.week_start === currentWeekStart && ts.week_end === currentWeekEnd
      )
      
      console.log('Found existing timesheet:', JSON.stringify(existingTimesheet))
      
      if (existingTimesheet) {
        // Load existing timesheet
        navigate(`/timesheets/${existingTimesheet.id}`)
      } else {
        // Navigate to new timesheet creation
        navigate('/timesheets/new')
      }
    } catch (err) {
      console.error('Error checking for existing timesheet:', err)
      navigate('/timesheets/new')
    } finally {
      setIsCheckingTimesheet(false)
    }
  }

  const handleView = (id: string) => {
    navigate(`/timesheets/${id}`)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      deleteTimesheet.mutate(id)
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading timesheets</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Timesheets</h1>
          <p className="text-text-secondary mt-2">
            View and manage your weekly timesheets
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={isCheckingTimesheet}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
          {isCheckingTimesheet ? 'Checking...' : 'New Timesheet'}
        </button>
      </div>

      {/* Timesheets Table */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading timesheets...</p>
          </div>
        ) : !timesheets || timesheets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">No timesheets yet</p>
            <button
              onClick={handleCreateNew}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Your First Timesheet
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider bg-surface">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Week
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Hours
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((timesheet: Timesheet) => (
                  <tr
                    key={timesheet.id}
                    className="border-b border-divider hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => handleView(timesheet.id)}
                  >
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                      {formatDate(timesheet.week_start)} -{' '}
                      {formatDate(timesheet.week_end)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {parseFloat(String(timesheet.total_hours)).toFixed(2)} hrs
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          timesheet.status
                        )}`}
                      >
                        {timesheet.status.charAt(0).toUpperCase() +
                          timesheet.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {timesheet.submitted_at
                        ? formatDate(timesheet.submitted_at)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm relative">
                      <div className="flex items-center gap-2">
                        {timesheet.status === 'draft' && (
                          <button
                            ref={(el) => {
                              if (el) buttonRefs.current[timesheet.id] = el
                            }}
                            onClick={() => {
                              if (openMenuId === timesheet.id) {
                                setOpenMenuId(null)
                              } else {
                                const rect = buttonRefs.current[timesheet.id]?.getBoundingClientRect()
                                if (rect) {
                                  setMenuPosition({
                                    top: rect.bottom + 8,
                                    left: rect.left + rect.width - 192,
                                  })
                                  setOpenMenuId(timesheet.id)
                                }
                              }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More options"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5 text-text-secondary" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fixed Position Dropdown Menu */}
        {openMenuId && menuPosition && (
          <div
            ref={menuRef}
            className="fixed w-48 bg-white border border-divider rounded-lg shadow-xl z-50"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              onClick={() => {
                navigate(`/timesheets/${openMenuId}`)
                setOpenMenuId(null)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-text-primary"
            >
              <EyeIcon className="w-4 h-4 text-primary" />
              <span className="text-sm">View</span>
            </button>
            <button
              onClick={() => {
                navigate(`/timesheets/${openMenuId}`)
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
          </div>
        )}
      </div>
    </div>
  )
}

