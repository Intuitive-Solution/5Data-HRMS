import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import {
  useTimesheet,
  useCreateTimesheet,
  useUpdateTimesheet,
  useSubmitTimesheet,
} from '../hooks/useTimesheets'
import { useMyAssignedProjects } from '@/modules/projects/hooks/useProjects'
import { timesheetApi } from '../services/timesheetApi'
import type { Timesheet, TimesheetRow, CreateTimesheetRequest, CreateTimesheetRowRequest, Project } from '@5data-hrms/shared'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Calculate month-bounded weeks (same logic as backend)
// Week structure (Sunday is start of week):
// - Week 1: 1st of month to first Saturday (may be partial)
// - Week 2-4: Sunday to Saturday (full weeks)
// - Week 5: Next Sunday to Saturday (or end of month if shorter)
// - Week 6: Remaining days after Week 5 (if any)
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

interface LocalRow {
  id?: string
  project: string
  project_name?: string
  project_client?: string
  task_description: string
  sun_hours: number
  mon_hours: number
  tue_hours: number
  wed_hours: number
  thu_hours: number
  fri_hours: number
  sat_hours: number
}

export default function TimesheetPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const { data: existingTimesheet, isLoading: isLoadingTimesheet } = useTimesheet(id)
  const { data: assignedProjects = [], isLoading: isLoadingProjects } = useMyAssignedProjects()
  const createTimesheet = useCreateTimesheet()
  const updateTimesheet = useUpdateTimesheet(id!)
  const submitTimesheet = useSubmitTimesheet(id!)

  const [weekStart, setWeekStart] = useState<string>('')
  const [weekEnd, setWeekEnd] = useState<string>('')
  const [rows, setRows] = useState<LocalRow[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState<string>('')
  
  // Month/Week selection for new timesheets
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(-1)
  const [availableWeeks, setAvailableWeeks] = useState<{ start: string; end: string }[]>([])

  // Initialize form with existing timesheet data
  useEffect(() => {
    if (existingTimesheet) {
      const weekStart = existingTimesheet.week_start
      const weekEnd = existingTimesheet.week_end
      setWeekStart(weekStart)
      setWeekEnd(weekEnd)
      
      // Initialize month/year from the timesheet
      const date = new Date(weekStart)
      const year = date.getFullYear()
      const month = date.getMonth()
      setSelectedYear(year)
      setSelectedMonth(month)
      
      // Calculate available weeks and find the matching week index
      const weeks = getMonthWeeks(year, month)
      setAvailableWeeks(weeks)
      
      // Find the week index that matches this timesheet's week
      const weekIndex = weeks.findIndex(w => w.start === weekStart && w.end === weekEnd)
      if (weekIndex !== -1) {
        setSelectedWeekIndex(weekIndex)
      } else {
        setSelectedWeekIndex(-1)
      }
      
      setRows(
        existingTimesheet.rows?.map(row => ({
          id: row.id,
          project: row.project,
          project_name: row.project_name,
          project_client: row.project_client,
          task_description: row.task_description,
          sun_hours: parseFloat(String(row.sun_hours)) || 0,
          mon_hours: parseFloat(String(row.mon_hours)) || 0,
          tue_hours: parseFloat(String(row.tue_hours)) || 0,
          wed_hours: parseFloat(String(row.wed_hours)) || 0,
          thu_hours: parseFloat(String(row.thu_hours)) || 0,
          fri_hours: parseFloat(String(row.fri_hours)) || 0,
          sat_hours: parseFloat(String(row.sat_hours)) || 0,
        })) || []
      )
    }
  }, [existingTimesheet])

  // Calculate available weeks when month/year changes
  useEffect(() => {
    const weeks = getMonthWeeks(selectedYear, selectedMonth)
    setAvailableWeeks(weeks)
    
    // For new timesheets: Auto-select the current week or last week
    if (!id && selectedWeekIndex === -1 && weeks.length > 0) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Find which week today falls into
      let foundWeekIndex = weeks.length - 1 // Default to last week
      for (let i = 0; i < weeks.length; i++) {
        if (todayStr >= weeks[i].start && todayStr <= weeks[i].end) {
          foundWeekIndex = i
          break
        }
      }
      
      setSelectedWeekIndex(foundWeekIndex)
      setWeekStart(weeks[foundWeekIndex].start)
      setWeekEnd(weeks[foundWeekIndex].end)
    }
    
    // For existing timesheets: Find and set the week index based on week_start
    // Always check if the current weekStart/weekEnd matches a week, even if selectedWeekIndex is already set
    // This ensures the dropdown stays in sync when timesheet data loads
    if (id && weekStart && weekEnd && weeks.length > 0) {
      const weekIndex = weeks.findIndex(w => w.start === weekStart && w.end === weekEnd)
      if (weekIndex !== -1 && selectedWeekIndex !== weekIndex) {
        setSelectedWeekIndex(weekIndex)
      }
    }
  }, [selectedYear, selectedMonth, id, weekStart, weekEnd])
  
  // Update week dates when week selection changes
  const handleWeekChange = async (weekIndex: number) => {
    setSelectedWeekIndex(weekIndex)
    if (availableWeeks[weekIndex]) {
      const weekStart = availableWeeks[weekIndex].start
      const weekEnd = availableWeeks[weekIndex].end
      setWeekStart(weekStart)
      setWeekEnd(weekEnd)
      
      // Fetch existing timesheet for this week
      try {
        const response = await timesheetApi.getMyTimesheets()
        const timesheetForWeek = response.data.find(
          ts => ts.week_start === weekStart && ts.week_end === weekEnd
        )
        
        if (timesheetForWeek) {
          // Load existing timesheet
          navigate(`/timesheets/${timesheetForWeek.id}`)
        } else {
          // No timesheet found for this week - clear rows
          setRows([])
        }
      } catch (err) {
        console.error('Failed to fetch timesheets:', err)
        setRows([])
      }
    }
  }
  
  // Update available weeks when month changes
  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    setSelectedWeekIndex(-1) // Reset week selection
  }

  const calculateDailyTotals = () => {
    const totals = [0, 0, 0, 0, 0, 0, 0]
    rows.forEach(row => {
      totals[0] += parseFloat(row.sun_hours.toString()) || 0
      totals[1] += parseFloat(row.mon_hours.toString()) || 0
      totals[2] += parseFloat(row.tue_hours.toString()) || 0
      totals[3] += parseFloat(row.wed_hours.toString()) || 0
      totals[4] += parseFloat(row.thu_hours.toString()) || 0
      totals[5] += parseFloat(row.fri_hours.toString()) || 0
      totals[6] += parseFloat(row.sat_hours.toString()) || 0
    })
    return totals
  }

  const validateDailyHours = (): boolean => {
    const totals = calculateDailyTotals()
    for (let i = 0; i < totals.length; i++) {
      if (totals[i] > 8) {
        setError(`${DAYS[i]} exceeds 8 hours maximum (${totals[i]} hours)`)
        return false
      }
    }
    return true
  }

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        project: '',
        task_description: '',
        sun_hours: 0,
        mon_hours: 0,
        tue_hours: 0,
        wed_hours: 0,
        thu_hours: 0,
        fri_hours: 0,
        sat_hours: 0,
      },
    ])
  }

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const handleRowChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newRows = [...rows]
    
    // If changing project, also update project_name and project_client
    if (field === 'project' && typeof value === 'string') {
      const selectedProject = assignedProjects.find((p: Project) => p.id === value)
      newRows[index] = {
        ...newRows[index],
        project: value,
        project_name: selectedProject?.name || '',
        project_client: selectedProject?.client || '',
      }
    } else {
      newRows[index] = {
        ...newRows[index],
        [field]: field.endsWith('_hours') ? parseFloat(value as string) || 0 : value,
      }
    }
    
    setRows(newRows)
    setError('')
  }

  const handleSave = async () => {
    if (!validateDailyHours()) {
      return
    }

    if (rows.length === 0) {
      setError('At least one row is required')
      return
    }

    setSaveStatus('saving')

    try {
      const rowsData: CreateTimesheetRowRequest[] = rows.map(row => ({
        project: row.project,
        task_description: row.task_description,
        sun_hours: row.sun_hours,
        mon_hours: row.mon_hours,
        tue_hours: row.tue_hours,
        wed_hours: row.wed_hours,
        thu_hours: row.thu_hours,
        fri_hours: row.fri_hours,
        sat_hours: row.sat_hours,
      }))

      if (id) {
        await updateTimesheet.mutateAsync({
          week_start: weekStart,
          week_end: weekEnd,
          rows: rowsData,
        })
      } else {
        await createTimesheet.mutateAsync({
          week_start: weekStart,
          week_end: weekEnd,
          rows: rowsData,
        })
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save timesheet')
      setSaveStatus('idle')
    }
  }

  const handleSubmit = async () => {
    if (!validateDailyHours()) {
      return
    }

    try {
      await submitTimesheet.mutateAsync()
      navigate('/timesheets')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit timesheet')
    }
  }

  const isReadOnly = existingTimesheet && ['submitted', 'approved'].includes(existingTimesheet.status)
  const isEditable = !isReadOnly && (!existingTimesheet || existingTimesheet.status === 'draft' || existingTimesheet.status === 'rejected')
  const dailyTotals = calculateDailyTotals()

  if (isLoadingTimesheet) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Loading timesheet...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/timesheets')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Timesheets
        </button>
        {existingTimesheet && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                existingTimesheet.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : existingTimesheet.status === 'submitted'
                    ? 'bg-blue-100 text-blue-800'
                    : existingTimesheet.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
              }`}
            >
              {existingTimesheet.status.charAt(0).toUpperCase() +
                existingTimesheet.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="space-y-6">
          {/* Week Selector */}
          <div className="border-b border-divider pb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {weekStart && weekEnd ? (
                <>
                  Week of {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                  {new Date(weekEnd + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </>
              ) : (
                'Select a Week'
              )}
            </h2>
            
            {/* Month/Week selector - shown for all timesheets */}
            <div className="flex gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Month
                  </label>
                  <select
                    value={`${selectedYear}-${selectedMonth}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-').map(Number)
                      handleMonthChange(year, month)
                    }}
                    className="input-field"
                    style={{ paddingRight: '2.5rem' }}
                  >
                    {/* Show current and previous 2 months */}
                    {Array.from({ length: 3 }, (_, i) => {
                      const date = new Date()
                      date.setDate(1) // Set to 1st to avoid month rollover issues
                      date.setMonth(date.getMonth() - i)
                      const year = date.getFullYear()
                      const month = date.getMonth()
                      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      return (
                        <option key={`${year}-${month}`} value={`${year}-${month}`}>
                          {monthName}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Week
                  </label>
                  <select
                    value={selectedWeekIndex.toString()}
                    onChange={(e) => handleWeekChange(Number(e.target.value))}
                    className="input-field"
                    style={{ paddingRight: '2.5rem' }}
                  >
                    {availableWeeks.map((week, index) => {
                      const startDate = new Date(week.start + 'T00:00:00')
                      const endDate = new Date(week.end + 'T00:00:00')
                      return (
                        <option key={index} value={index}>
                          Week {index + 1}: {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            
            {/* Show dates (read-only display) */}
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Start Date
                </label>
                <input
                  type="text"
                  value={weekStart ? new Date(weekStart + 'T00:00:00').toLocaleDateString('en-GB') : ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  End Date
                </label>
                <input
                  type="text"
                  value={weekEnd ? new Date(weekEnd + 'T00:00:00').toLocaleDateString('en-GB') : ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Timesheet Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-divider bg-surface px-4 py-3 text-left font-semibold text-text-primary w-40">
                    Project
                  </th>
                  <th className="border border-divider bg-surface px-4 py-3 text-left font-semibold text-text-primary w-48">
                    Task Description
                  </th>
                  {DAY_ABBR.map((day, idx) => {
                    // Guard against empty weekStart/weekEnd
                    if (!weekStart || !weekEnd) {
                      return (
                        <th
                          key={day}
                          className="border border-divider px-2 py-3 text-center font-semibold w-16 bg-gray-50 text-text-disabled"
                        >
                          <div>{day}</div>
                          <div className="text-xs text-text-secondary">-</div>
                        </th>
                      )
                    }

                    // Find the Sunday of the week containing weekStart
                    const weekStartDateObj = new Date(weekStart + 'T00:00:00')
                    const sundayOfWeek = new Date(weekStartDateObj)
                    sundayOfWeek.setDate(sundayOfWeek.getDate() - sundayOfWeek.getDay())
                    
                    // Calculate the date for this column (Sun=0, Mon=1, ..., Sat=6)
                    const dayDate = new Date(sundayOfWeek)
                    dayDate.setDate(dayDate.getDate() + idx)
                    
                    // Compare dates properly (normalize to start of day)
                    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
                    const weekStartNorm = new Date(weekStart + 'T00:00:00')
                    weekStartNorm.setHours(0, 0, 0, 0)
                    const weekEndNorm = new Date(weekEnd + 'T00:00:00')
                    weekEndNorm.setHours(23, 59, 59, 999)
                    
                    const isOutsideWeek = dayStart < weekStartNorm || dayStart > weekEndNorm
                    
                    return (
                      <th
                        key={day}
                        className={`border border-divider px-2 py-3 text-center font-semibold w-16 ${
                          isOutsideWeek
                            ? 'bg-gray-50 text-text-disabled'
                            : 'bg-surface text-text-primary'
                        }`}
                      >
                        <div>{day}</div>
                        <div className="text-xs text-text-secondary">
                          {isOutsideWeek ? '-' : dayDate.getDate()}
                        </div>
                      </th>
                    )
                  })}
                  <th className="border border-divider bg-surface px-4 py-3 text-center font-semibold text-text-primary w-16">
                    Total
                  </th>
                  {isEditable && (
                    <th className="border border-divider bg-surface px-4 py-3 text-center font-semibold text-text-primary w-12">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-divider px-4 py-3">
                      <select
                        value={row.project}
                        onChange={(e) =>
                          handleRowChange(idx, 'project', e.target.value)
                        }
                        disabled={!isEditable || isLoadingProjects}
                        className="input-field"
                      >
                        <option value="">
                          {isLoadingProjects ? 'Loading projects...' : 'Select Project'}
                        </option>
                        {assignedProjects && assignedProjects.length > 0 ? (
                          assignedProjects.map((project: Project) => (
                            <option key={project.id} value={project.id}>
                              {project.name} ({project.client})
                            </option>
                          ))
                        ) : (
                          !isLoadingProjects && <option value="">No projects assigned</option>
                        )}
                      </select>
                    </td>
                    <td className="border border-divider px-4 py-3">
                      <input
                        type="text"
                        value={row.task_description}
                        onChange={(e) =>
                          handleRowChange(
                            idx,
                            'task_description',
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                        className="input-field"
                        placeholder="Task description"
                      />
                    </td>
                    {['sun_hours', 'mon_hours', 'tue_hours', 'wed_hours', 'thu_hours', 'fri_hours', 'sat_hours'].map(
                      (field, dayIdx) => {
                        // Find the Sunday of the week containing weekStart
                        const weekStartDateObj = new Date(weekStart + 'T00:00:00')
                        const sundayOfWeek = new Date(weekStartDateObj)
                        sundayOfWeek.setDate(sundayOfWeek.getDate() - sundayOfWeek.getDay())
                        
                        // Calculate the date for this column (Sun=0, Mon=1, ..., Sat=6)
                        const dayDate = new Date(sundayOfWeek)
                        dayDate.setDate(dayDate.getDate() + dayIdx)
                        
                        // Compare dates properly (normalize to start of day)
                        const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
                        const weekStartNorm = new Date(weekStart + 'T00:00:00')
                        weekStartNorm.setHours(0, 0, 0, 0)
                        const weekEndNorm = new Date(weekEnd + 'T00:00:00')
                        weekEndNorm.setHours(23, 59, 59, 999)
                        
                        const isOutsideWeek = dayStart < weekStartNorm || dayStart > weekEndNorm

                        return (
                          <td
                            key={field}
                            className={`border border-divider px-2 py-3 text-center ${
                              isOutsideWeek ? 'bg-gray-50' : ''
                            }`}
                          >
                            {isOutsideWeek ? (
                              <div className="text-text-disabled text-center py-2">-</div>
                            ) : (
                              <input
                                type="number"
                                value={row[field as keyof LocalRow]}
                                onChange={(e) =>
                                  handleRowChange(idx, field, e.target.value)
                                }
                                disabled={!isEditable}
                                className="input-field text-center w-full"
                                placeholder="0"
                                min="0"
                                max="8"
                                step="0.5"
                              />
                            )}
                          </td>
                        )
                      }
                    )}
                    <td className="border border-divider px-4 py-3 text-center font-medium">
                      {(
                        parseFloat(String(row.sun_hours || 0)) +
                        parseFloat(String(row.mon_hours || 0)) +
                        parseFloat(String(row.tue_hours || 0)) +
                        parseFloat(String(row.wed_hours || 0)) +
                        parseFloat(String(row.thu_hours || 0)) +
                        parseFloat(String(row.fri_hours || 0)) +
                        parseFloat(String(row.sat_hours || 0))
                      ).toFixed(2)}
                    </td>
                    {isEditable && (
                      <td className="border border-divider px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Daily Totals Row */}
                <tr className="bg-surface font-semibold">
                  <td colSpan={2} className="border border-divider px-4 py-3 text-right">
                    Daily Total:
                  </td>
                  {dailyTotals.map((total, idx) => {
                    // Find the Sunday of the week containing weekStart
                    const weekStartDateObj = new Date(weekStart + 'T00:00:00')
                    const sundayOfWeek = new Date(weekStartDateObj)
                    sundayOfWeek.setDate(sundayOfWeek.getDate() - sundayOfWeek.getDay())
                    
                    // Calculate the date for this column (Sun=0, Mon=1, ..., Sat=6)
                    const dayDate = new Date(sundayOfWeek)
                    dayDate.setDate(dayDate.getDate() + idx)
                    
                    // Compare dates properly (normalize to start of day)
                    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
                    const weekStartNorm = new Date(weekStart + 'T00:00:00')
                    weekStartNorm.setHours(0, 0, 0, 0)
                    const weekEndNorm = new Date(weekEnd + 'T00:00:00')
                    weekEndNorm.setHours(23, 59, 59, 999)
                    
                    const isOutsideWeek = dayStart < weekStartNorm || dayStart > weekEndNorm

                    return (
                      <td
                        key={idx}
                        className={`border border-divider px-2 py-3 text-center ${
                          isOutsideWeek
                            ? 'bg-gray-50 text-text-disabled'
                            : total > 8
                              ? 'bg-red-100 text-red-800'
                              : ''
                        }`}
                      >
                        {isOutsideWeek ? '-' : total.toFixed(2)}
                      </td>
                    )
                  })}
                  <td className="border border-divider px-4 py-3 text-center">
                    {dailyTotals.reduce((a, b) => a + b, 0).toFixed(2)}
                  </td>
                  {isEditable && <td className="border border-divider" />}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          {isEditable && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Add Row
            </button>
          )}

          {/* Action Buttons */}
          <div className="border-t border-divider pt-6 flex gap-3 justify-end">
            <button
              onClick={() => navigate('/timesheets')}
              className="px-6 py-2 border border-divider rounded-lg hover:bg-surface transition-colors text-text-primary"
            >
              Cancel
            </button>

            {isEditable && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save as Draft'}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={saveStatus === 'saving'}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckIcon className="w-5 h-5" />
                  Submit
                </button>
              </>
            )}

            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckIcon className="w-5 h-5" />
                Saved
              </div>
            )}
          </div>

          {/* Rejection Reason (if rejected) */}
          {existingTimesheet?.status === 'rejected' && existingTimesheet?.rejection_reason && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 mb-2">Rejection Reason:</p>
              <p className="text-sm text-red-800">{existingTimesheet.rejection_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

