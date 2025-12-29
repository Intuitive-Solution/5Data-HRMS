import { useMemo } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import type { Employee } from '@5data-hrms/shared'

interface ManagerSelectProps {
  value: string
  onChange: (value: string) => void
  excludeEmployeeId?: string // ID of employee to exclude from list (e.g., current employee)
  className?: string
  disabled?: boolean
}

/**
 * ManagerSelect - Dropdown component for selecting a reporting manager
 * Fetches all employees and displays them in a dropdown, excluding the current employee
 */
export default function ManagerSelect({
  value,
  onChange,
  excludeEmployeeId,
  className = 'input-field',
  disabled = false,
}: ManagerSelectProps) {
  // Fetch all employees - using a large page size to get all at once
  // In production, you might want to implement pagination or a search endpoint
  const { data, isLoading } = useEmployees(1, '', 'employee_id')

  // Filter employees: exclude current employee and only show active employees
  const availableManagers = useMemo(() => {
    if (!data?.results) return []
    
    return data.results.filter((employee: Employee) => {
      // Exclude the current employee
      if (excludeEmployeeId && employee.id === excludeEmployeeId) {
        return false
      }
      // Only show active employees as potential managers
      return employee.employment_status === 'active'
    })
  }, [data?.results, excludeEmployeeId])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  if (isLoading) {
    return (
      <select disabled className={className}>
        <option>Loading managers...</option>
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    >
      <option value="">Select a manager (optional)</option>
      {availableManagers.map((employee: Employee) => {
        const firstName = employee.user?.first_name || ''
        const lastName = employee.user?.last_name || ''
        const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : ''
        const displayName = fullName 
          ? `${employee.employee_id} - ${fullName} (${employee.job_title})`
          : `${employee.employee_id} - ${employee.job_title}`
        
        return (
          <option key={employee.id} value={employee.id}>
            {displayName}
          </option>
        )
      })}
    </select>
  )
}

