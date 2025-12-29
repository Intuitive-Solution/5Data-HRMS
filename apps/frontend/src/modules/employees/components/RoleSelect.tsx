import { useFetchRoles, useGetUserRoles, useAssignRole, useRemoveRole } from '../hooks/useRoles'
import type { UserRole } from '@5data-hrms/shared'

interface RoleSelectProps {
  userId?: string
  employeeId?: string
  onRoleChange?: (roles: string[]) => void
  disabled?: boolean
  label?: string
}

/**
 * Component for selecting and managing user roles
 */
export default function RoleSelect({
  userId,
  employeeId,
  onRoleChange,
  disabled = false,
  label = 'Role',
}: RoleSelectProps) {
  const { data: roles = [], isLoading: rolesLoading } = useFetchRoles()
  const { data: userRoles = [], isLoading: userRolesLoading } = useGetUserRoles(employeeId)
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()

  const assignedRoleNames = userRoles.map((ur) => ur.role_name)

  const handleRoleChange = async (roleName: string, isChecked: boolean) => {
    if (!employeeId) return

    try {
      if (isChecked) {
        await assignRole.mutateAsync({ userId: employeeId, roleName })
      } else {
        await removeRole.mutateAsync({ userId: employeeId, roleName })
      }

      if (onRoleChange) {
        const updatedRoles = isChecked
          ? [...assignedRoleNames, roleName]
          : assignedRoleNames.filter((r) => r !== roleName)
        onRoleChange(updatedRoles)
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  if (rolesLoading || userRolesLoading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">{label}</label>
        <p className="text-text-secondary text-sm">Loading roles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary">{label}</label>

      {employeeId ? (
        <div className="space-y-2 border border-divider rounded-card p-3 bg-surface">
          {roles.length > 0 ? (
            roles.map((role) => (
              <div key={role.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  name={role.name}
                  checked={assignedRoleNames.includes(role.name)}
                  onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                  disabled={disabled || assignRole.isPending || removeRole.isPending}
                  className="mt-1 w-4 h-4 rounded border-divider cursor-pointer"
                />
                <label
                  htmlFor={`role-${role.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <p className="text-sm font-medium text-text-primary">{role.display_name}</p>
                  {role.description && (
                    <p className="text-xs text-text-secondary mt-0.5">{role.description}</p>
                  )}
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-secondary">No roles available</p>
          )}
        </div>
      ) : (
        <select
          disabled={disabled || rolesLoading}
          className="input-field w-full"
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.display_name}
            </option>
          ))}
        </select>
      )}

      {(assignRole.isError || removeRole.isError) && (
        <p className="text-red-500 text-xs">Error updating role. Please try again.</p>
      )}
    </div>
  )
}

