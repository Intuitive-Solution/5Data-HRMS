import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEmployees } from '@/modules/employees/hooks/useEmployees'
import {
  useProjectAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from '../hooks/useProjects'
import type { ProjectAssignment, Employee } from '@5data-hrms/shared'

interface AssignmentsTabProps {
  projectId: string
  canEdit: boolean
}

export default function AssignmentsTab({ projectId, canEdit }: AssignmentsTabProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [role, setRole] = useState<'owner' | 'lead' | 'member'>('member')
  const [allocationPercentage, setAllocationPercentage] = useState<number>(100)
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Fetch all employees (will filter active ones on display)
  const { data: employeesData } = useEmployees(1, '', 'employee_id')

  // Fetch project assignments
  const { data: assignments, isLoading } = useProjectAssignments(projectId)

  // Mutations
  const createAssignment = useCreateAssignment()
  const deleteAssignment = useDeleteAssignment(projectId)

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEmployeeId || !role) {
      alert('Please select an employee and a role')
      return
    }

    if (allocationPercentage < 0 || allocationPercentage > 100) {
      alert('Allocation percentage must be between 0 and 100')
      return
    }

    try {
      await createAssignment.mutateAsync({
        employee: selectedEmployeeId,
        project: projectId,
        role: role,
        allocation_percentage: allocationPercentage,
        assigned_date: assignedDate,
      })

      // Reset form
      setSelectedEmployeeId('')
      setRole('member')
      setAllocationPercentage(100)
      setAssignedDate(new Date().toISOString().split('T')[0])
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding assignment:', error)
      alert('Error adding assignment. Please try again.')
    }
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      deleteAssignment.mutate(assignmentId)
    }
  }

  // Get assigned employee IDs
  const assignedEmployeeIds = new Set(
    assignments?.map((a: ProjectAssignment) => String(a.employee)) || []
  )

  // Filter available employees (active and not already assigned)
  const availableEmployees =
    employeesData?.results.filter(
      (emp: Employee) => 
        emp.employment_status === 'active' && 
        !assignedEmployeeIds.has(String(emp.id))
    ) || []

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading assignments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Assignment Button */}
      {canEdit && (
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Assign Employee
        </button>
      )}

      {/* Add Assignment Form */}
      {showAddForm && (
        <div className="border border-divider rounded-card p-6 bg-surface">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Assign Employee to Project
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Employee *
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="input-field"
              >
                <option value="">Choose an employee...</option>
                {availableEmployees.map((emp: Employee) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.user?.first_name} {emp.user?.last_name}
                  </option>
                ))}
              </select>
              {availableEmployees.length === 0 && (
                <p className="text-text-secondary text-sm mt-2">
                  No active employees available to assign
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'owner' | 'lead' | 'member')}
                className="input-field"
              >
                <option value="member">Member</option>
                <option value="lead">Lead</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Allocation Percentage *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={allocationPercentage}
                onChange={(e) => setAllocationPercentage(parseFloat(e.target.value) || 0)}
                placeholder="0-100"
                className="input-field"
              />
              <p className="text-text-secondary text-xs mt-1">
                Percentage of time allocated to this project (0-100)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assignment Date
              </label>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createAssignment.isPending || !selectedEmployeeId || !role}
                className="btn-primary"
              >
                {createAssignment.isPending ? 'Adding...' : 'Add Assignment'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>

            {createAssignment.isError && (
              <p className="text-red-600 text-sm">
                Error adding assignment. Please try again.
              </p>
            )}
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div>
        {!assignments || assignments.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-card">
            <p className="text-text-secondary">No employees assigned to this project yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment: ProjectAssignment) => {
              // Find employee details
              const employee = employeesData?.results.find(
                (e: Employee) => String(e.id) === String(assignment.employee)
              )

              return (
                <div
                  key={assignment.id}
                  className="border border-divider rounded-card p-4 flex items-center justify-between hover:bg-surface transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {employee?.picture ? (
                        <img
                          src={employee.picture}
                          alt={`${employee.user?.first_name} ${employee.user?.last_name}`}
                          className="w-10 h-10 rounded-full object-cover border border-divider"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                          {employee?.user?.first_name?.charAt(0)}
                          {employee?.user?.last_name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">
                          {employee?.user?.first_name} {employee?.user?.last_name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {employee?.employee_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">Role</p>
                      <p className="font-medium text-text-primary capitalize">
                        {assignment.role}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-text-secondary">Allocation</p>
                      <p className="font-medium text-text-primary">
                        {assignment.allocation_percentage}%
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-text-secondary">Assigned Date</p>
                      <p className="font-medium text-text-primary">
                        {new Date(assignment.assigned_date).toLocaleDateString()}
                      </p>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        disabled={deleteAssignment.isPending}
                        className="p-2 hover:bg-red-50 rounded-card transition-colors text-red-600 disabled:opacity-50"
                        title="Remove assignment"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

