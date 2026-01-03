/**
 * Multi-select dropdown for role visibility selection
 */
import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useFetchRoles } from '@/modules/employees/hooks/useRoles'

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
}

interface RoleMultiSelectProps {
  selectedRoles: string[]
  onChange: (roles: string[]) => void
  disabled?: boolean
}

export default function RoleMultiSelect({
  selectedRoles,
  onChange,
  disabled = false,
}: RoleMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: rolesData, isLoading } = useFetchRoles()

  // Handle both paginated response { results: [...] } and direct array response
  const roles: Role[] = useMemo(() => {
    if (!rolesData) return []
    if (Array.isArray(rolesData)) return rolesData
    if (rolesData && typeof rolesData === 'object' && 'results' in rolesData) {
      return (rolesData as { results: Role[] }).results
    }
    return []
  }, [rolesData])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      onChange(selectedRoles.filter(r => r !== roleName))
    } else {
      onChange([...selectedRoles, roleName])
    }
  }

  const handleRemoveRole = (roleName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedRoles.filter(r => r !== roleName))
  }

  const getDisplayName = (roleName: string) => {
    const role = roles?.find(r => r.name === roleName)
    return role?.display_name || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected roles display / trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full min-h-[44px] px-3 py-2 text-left
          border border-divider rounded-card bg-white
          flex items-center flex-wrap gap-2
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
          transition-colors
        `}
      >
        {selectedRoles.length === 0 ? (
          <span className="text-text-secondary">Select roles...</span>
        ) : (
          selectedRoles.map(role => (
            <span
              key={role}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
            >
              {getDisplayName(role)}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveRole(role, e)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}
        <ChevronDownIcon
          className={`w-5 h-5 text-text-secondary ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-divider rounded-card shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-text-secondary text-sm">Loading roles...</div>
          ) : !roles || roles.length === 0 ? (
            <div className="px-4 py-3 text-text-secondary text-sm">No roles available</div>
          ) : (
            roles.map(role => (
              <button
                key={role.name}
                type="button"
                onClick={() => handleToggleRole(role.name)}
                className={`
                  w-full px-4 py-3 text-left flex items-center justify-between
                  hover:bg-surface transition-colors
                  ${selectedRoles.includes(role.name) ? 'bg-primary/5' : ''}
                `}
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{role.display_name}</p>
                  {role.description && (
                    <p className="text-xs text-text-secondary mt-0.5">{role.description}</p>
                  )}
                </div>
                {selectedRoles.includes(role.name) && (
                  <CheckIcon className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

