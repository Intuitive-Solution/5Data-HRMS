import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useMyLeaves, useLeaveBalance, useDeleteLeave, useHolidays } from '../hooks/useLeaves'
import ApplyLeaveModal from '../components/ApplyLeaveModal'
import type { Leave } from '@5data-hrms/shared'

const LEAVE_TYPE_LABELS: Record<string, string> = {
  paid_leave: 'Paid Leave',
  sick_leave: 'Sick Leave',
  casual_leave: 'Casual Leave',
  earned_leave: 'Earned Leave',
  unpaid_leave: 'Unpaid Leave',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  approved: { bg: 'bg-green-50', text: 'text-green-700' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700' },
}

export default function LeaveListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data: leaves, isLoading: leavesLoading, error: leavesError } = useMyLeaves(page)
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useLeaveBalance()
  const { data: holidays } = useHolidays()
  const deleteLeave = useDeleteLeave()

  const handleDelete = (leave: Leave) => {
    // Check if leave can be deleted (start_date > today)
    const leaveStartDate = new Date(leave.start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (leaveStartDate <= today) {
      alert('Cannot delete leaves that have already started or are in the past')
      return
    }

    if (window.confirm(`Are you sure you want to delete this leave request? (${leave.start_date} - ${leave.end_date})`)) {
      deleteLeave.mutate(leave.id)
    }
  }

  const canDeleteLeave = (leave: Leave): boolean => {
    const leaveStartDate = new Date(leave.start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return leaveStartDate > today
  }

  // Calculate used leaves by type
  const calculateUsedLeaves = () => {
    if (!leaves?.results) return {}
    const used: Record<string, number> = {
      paid_leave: 0,
      sick_leave: 0,
      casual_leave: 0,
      earned_leave: 0,
    }

    leaves.results.forEach(leave => {
      if (leave.status === 'approved' && used[leave.leave_type] !== undefined) {
        used[leave.leave_type] += leave.number_of_days
      }
    })

    return used
  }

  const used = calculateUsedLeaves()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Leave Management</h1>
          <p className="text-text-secondary mt-1">Manage and track your leave requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Apply Leave
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-4 gap-6">
        {balanceLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-divider">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </>
        ) : balanceError ? (
          <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            Error loading leave balance. Please refresh the page.
          </div>
        ) : (
          <>
            {/* Sick Leave Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-divider">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Sick Leave</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">
                  {balance ? (Number(balance.sick_leave) - (used.sick_leave || 0)).toFixed(1) : '0.0'}
                </span>
                <span className="text-sm text-text-secondary">
                  / {balance ? Number(balance.sick_leave) : '0'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                {used.sick_leave || 0} used
              </p>
            </div>

            {/* Casual Leave Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-divider">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Casual Leave</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">
                  {balance ? (Number(balance.casual_leave) - (used.casual_leave || 0)).toFixed(1) : '0.0'}
                </span>
                <span className="text-sm text-text-secondary">
                  / {balance ? Number(balance.casual_leave) : '0'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                {used.casual_leave || 0} used
              </p>
            </div>

            {/* Earned Leave Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-divider">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Earned Leave</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">
                  {balance ? (Number(balance.earned_leave) - (used.earned_leave || 0)).toFixed(1) : '0.0'}
                </span>
                <span className="text-sm text-text-secondary">
                  / {balance ? Number(balance.earned_leave) : '0'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                {used.earned_leave || 0} used
              </p>
            </div>

            {/* Unpaid Leave Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-divider">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Unpaid Leave</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">-</span>
                <span className="text-sm text-text-secondary">Unlimited</span>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                No limit
              </p>
            </div>
          </>
        )}
      </div>

      {/* Leave Requests and Holidays Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Leave Requests Table - 9 columns */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-lg shadow-sm border border-divider overflow-hidden">
          <div className="p-6 border-b border-divider">
            <h2 className="text-lg font-semibold text-text-primary">Leave Requests</h2>
          </div>

          {leavesLoading ? (
            <div className="p-6 text-center text-text-secondary">
              Loading leave requests...
            </div>
          ) : leavesError ? (
            <div className="p-6 text-center text-red-600">
              Error loading leave requests
            </div>
          ) : leaves && leaves.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface border-b border-divider">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.results.map(leave => (
                      <tr key={leave.id} className="border-b border-divider hover:bg-surface transition-colors">
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(leave.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(leave.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {LEAVE_TYPE_LABELS[leave.leave_type]}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {leave.number_of_days}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[leave.status].bg} ${STATUS_COLORS[leave.status].text}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {canDeleteLeave(leave) ? (
                            <button
                              onClick={() => handleDelete(leave)}
                              disabled={deleteLeave.isPending}
                              className="inline-flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete leave"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span className="text-xs">Delete</span>
                            </button>
                          ) : (
                            <span className="text-xs text-text-secondary">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {leaves && leaves.count > 0 && (
                <div className="px-6 py-4 border-t border-divider flex items-center justify-between bg-surface">
                  <p className="text-sm text-text-secondary">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, leaves.count)} of{' '}
                    {leaves.count} leaves
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!leaves.previous}
                      className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-text-secondary">Page {page}</span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!leaves.next}
                      className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-text-secondary">
              No leave requests yet. Click "Apply Leave" to create one.
            </div>
          )}
        </div>

        {/* Holidays Table - 3 columns */}
        {holidays && holidays.length > 0 && (
          <div className="col-span-12 lg:col-span-3 bg-white rounded-lg shadow-sm border border-divider overflow-hidden">
            <div className="p-6 border-b border-divider">
              <h2 className="text-lg font-semibold text-text-primary">Holidays</h2>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-surface border-b border-divider sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday, index) => (
                    <tr key={index} className="border-b border-divider hover:bg-surface transition-colors">
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {new Date(holiday.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-primary">
                        {holiday.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

