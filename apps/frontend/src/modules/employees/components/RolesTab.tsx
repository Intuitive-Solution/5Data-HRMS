import { useGetUserRoles, useFetchRoles, useAssignRole, useRemoveRole } from '../hooks/useRoles'
import { useState } from 'react'

interface RolesTabProps {
  employeeUserId?: string
  isEditable?: boolean
}

/**
 * Tab component for displaying and managing employee roles
 */
export default function RolesTab({ employeeUserId, isEditable = false }: RolesTabProps) {
  const { data: userRolesData, isLoading: userRolesLoading, error: userRolesError } = useGetUserRoles(
    employeeUserId
  )
  const { data: availableRolesData, isLoading: rolesLoading, error: rolesError } = useFetchRoles()
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()

  const [selectedRole, setSelectedRole] = useState('')

  // Ensure both arrays are properly typed - handle pagination wrappers
  const userRoles = Array.isArray(userRolesData)
    ? userRolesData
    : userRolesData && Array.isArray(userRolesData.results)
      ? userRolesData.results
      : []

  const availableRoles = Array.isArray(availableRolesData)
    ? availableRolesData
    : availableRolesData && Array.isArray(availableRolesData.results)
      ? availableRolesData.results
      : []
  
  // Debug logging
  console.log('RolesTab Debug:', {
    employeeUserId,
    userRolesData,
    availableRolesData,
    userRoles,
    availableRoles,
    userRolesLoading,
    rolesLoading,
    userRolesError,
    rolesError,
  })
  
  // Extract assigned role names - safely handle different response formats
  const assignedRoleNames = Array.isArray(userRoles)
    ? userRoles
        .map((ur) => {
          // Handle both formats: direct string or object with role_name property
          if (typeof ur === 'string') return ur
          if (typeof ur === 'object' && ur !== null) {
            return ur.role_name || ur.name || ''
          }
          return ''
        })
        .filter(Boolean)
    : []
  
  // Calculate available roles for assignment
  const availableForAssignment = Array.isArray(availableRoles)
    ? availableRoles.filter((role) => {
        // Handle both role.name and other possible formats
        const roleName = role.name || String((role as any).id)
        return !assignedRoleNames.includes(roleName)
      })
    : []

  const handleAssignRole = async () => {
    if (!selectedRole || !employeeUserId) return

    try {
      await assignRole.mutateAsync({ userId: employeeUserId, roleName: selectedRole })
      setSelectedRole('')
    } catch (error) {
      console.error('Error assigning role:', error)
    }
  }

  const handleRemoveRole = async (roleName: string) => {
    if (!employeeUserId) return

    try {
      await removeRole.mutateAsync({ userId: employeeUserId, roleName })
    } catch (error) {
      console.error('Error removing role:', error)
    }
  }

  if (userRolesLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Loading roles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Assigned Roles */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Assigned Roles</h3>

        {userRoles.length > 0 ? (
          <div className="space-y-3">
            {userRoles.map((ur) => (
              <div key={ur.id} className="flex items-center justify-between p-4 bg-surface rounded-card">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{ur.role_display_name}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Assigned on {new Date(ur.assigned_at).toLocaleDateString()}
                    {ur.assigned_by_email && ` by ${ur.assigned_by_email}`}
                  </p>
                </div>

                {isEditable && (
                  <button
                    onClick={() => handleRemoveRole(ur.role_name)}
                    disabled={removeRole.isPending}
                    className="ml-4 px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-surface rounded-card text-center">
            <p className="text-text-secondary">No roles assigned</p>
          </div>
        )}
      </div>

      {/* Assign New Role */}
      {isEditable && (
        <div className="border-t border-divider pt-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Assign New Role</h3>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Available Roles
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={assignRole.isPending || rolesLoading || (availableRoles.length > 0 && availableForAssignment.length === 0)}
                className="input-field w-full"
              >
                <option value="">
                  {rolesLoading
                    ? 'Loading roles...'
                    : availableRoles.length === 0
                      ? 'No roles available'
                      : availableForAssignment.length === 0
                        ? 'All roles already assigned'
                        : 'Select a role'}
                </option>
                {availableForAssignment.length > 0 && availableForAssignment.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssignRole}
              disabled={!selectedRole || assignRole.isPending}
              className="px-4 py-2 bg-primary text-white rounded-card hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {assignRole.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>

          {(assignRole.isError || removeRole.isError) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-card text-red-700 text-sm">
              Error updating role. Please try again.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

