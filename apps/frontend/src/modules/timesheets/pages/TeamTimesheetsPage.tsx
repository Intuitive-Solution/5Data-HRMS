import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import {
  useTeamTimesheets,
  useApproveTimesheet,
  useRejectTimesheet,
} from '../hooks/useTimesheets'
import type { Timesheet } from '@5data-hrms/shared'

export default function TeamTimesheetsPage() {
  const navigate = useNavigate()
  const { data: timesheets = [], isLoading, error } = useTeamTimesheets()
  const approveTimesheet = useApproveTimesheet('')
  const rejectTimesheet = useRejectTimesheet('')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleApprove = async (timesheetId: string) => {
    setLoadingId(timesheetId)
    try {
      await approveTimesheet.mutateAsync()
      navigate('/')
    } catch (err: any) {
      console.error('Failed to approve:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (timesheetId: string) => {
    const reason = rejectionReasons[timesheetId] || ''
    if (!reason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setLoadingId(timesheetId)
    try {
      await rejectTimesheet.mutateAsync(reason)
      setRejectionReasons({ ...rejectionReasons, [timesheetId]: '' })
      setExpandedId(null)
    } catch (err: any) {
      console.error('Failed to reject:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading team timesheets</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Team Timesheets</h1>
        <p className="text-text-secondary mt-2">
          Review and approve timesheets from your team members
        </p>
      </div>

      {/* Timesheets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading timesheets...</p>
          </div>
        ) : !timesheets || timesheets.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No pending timesheets</p>
          </div>
        ) : (
          timesheets.map((timesheet: Timesheet) => (
            <div key={timesheet.id} className="card">
              {/* Header */}
              <div
                onClick={() =>
                  setExpandedId(expandedId === timesheet.id ? null : timesheet.id)
                }
                className="flex items-center justify-between cursor-pointer py-4 hover:bg-surface rounded-lg px-4 -mx-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {timesheet.employee_name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {formatDate(timesheet.week_start)} -{' '}
                        {formatDate(timesheet.week_end)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        timesheet.status
                      )}`}
                    >
                      {timesheet.status.charAt(0).toUpperCase() +
                        timesheet.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-text-primary">
                      {timesheet.total_hours.toFixed(2)} hrs
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-text-secondary transition-transform ${
                      expandedId === timesheet.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === timesheet.id && (
                <div className="border-t border-divider pt-4 space-y-4">
                  {/* Timesheet Details Grid */}
                  {timesheet.rows && timesheet.rows.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-divider">
                            <th className="px-3 py-2 text-left font-semibold text-text-primary">
                              Project
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-text-primary">
                              Task
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Sun
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Mon
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Tue
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Wed
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Thu
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Fri
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Sat
                            </th>
                            <th className="px-3 py-2 text-center font-semibold text-text-primary">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {timesheet.rows.map((row, idx) => (
                            <tr key={idx} className="border-b border-divider">
                              <td className="px-3 py-2 text-text-primary font-medium">
                                {row.project_name}
                              </td>
                              <td className="px-3 py-2 text-text-secondary">
                                {row.task_description}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.sun_hours > 0 ? row.sun_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.mon_hours > 0 ? row.mon_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.tue_hours > 0 ? row.tue_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.wed_hours > 0 ? row.wed_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.thu_hours > 0 ? row.thu_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.fri_hours > 0 ? row.fri_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.sat_hours > 0 ? row.sat_hours : '-'}
                              </td>
                              <td className="px-3 py-2 text-center font-medium">
                                {row.row_total.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Daily Totals */}
                  {timesheet.daily_totals && (
                    <div className="bg-surface rounded-lg p-3">
                      <div className="grid grid-cols-7 gap-2 text-sm">
                        {Object.entries(timesheet.daily_totals).map(
                          ([day, total]) => (
                            <div key={day} className="text-center">
                              <div className="text-xs text-text-secondary mb-1">
                                {day.slice(0, 3)}
                              </div>
                              <div className="font-semibold text-text-primary">
                                {(total as number).toFixed(2)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Full Details Link */}
                  <button
                    onClick={() => navigate(`/timesheets/${timesheet.id}`)}
                    className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View Full Details
                  </button>

                  {/* Rejection Reason Field */}
                  {timesheet.status === 'submitted' && (
                    <div className="space-y-3 pt-4 border-t border-divider">
                      <label className="block text-sm font-medium text-text-primary">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={rejectionReasons[timesheet.id] || ''}
                        onChange={(e) =>
                          setRejectionReasons({
                            ...rejectionReasons,
                            [timesheet.id]: e.target.value,
                          })
                        }
                        placeholder="Provide feedback for rejection (optional)"
                        className="input-field"
                        rows={3}
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(timesheet.id)}
                          disabled={loadingId === timesheet.id}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          <CheckIcon className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(timesheet.id)}
                          disabled={loadingId === timesheet.id}
                          className="flex-1 px-4 py-2 border border-red-300 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                          <XMarkIcon className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

