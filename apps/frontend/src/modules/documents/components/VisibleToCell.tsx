/**
 * Inline editable cell for "Visible To" column
 * Shows multi-select dropdown for HR/Admin users
 * Uses fixed positioning to avoid overflow clipping issues
 */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon, CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useFetchRoles } from '@/modules/employees/hooks/useRoles'
import { useUpdateDocumentVisibility } from '../hooks/useDocuments'

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
}

interface VisibleToCellProps {
  documentId: number
  visibleTo: string[]
  isMobile?: boolean
}

export default function VisibleToCell({ documentId, visibleTo, isMobile = false }: VisibleToCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(visibleTo)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: rolesData, isLoading } = useFetchRoles()
  const updateVisibility = useUpdateDocumentVisibility()

  // Handle both paginated and direct array response
  const roles: Role[] = useMemo(() => {
    if (!rolesData) return []
    if (Array.isArray(rolesData)) return rolesData
    if (rolesData && typeof rolesData === 'object' && 'results' in rolesData) {
      return (rolesData as { results: Role[] }).results
    }
    return []
  }, [rolesData])

  // Sync local state with props when they change
  useEffect(() => {
    setSelectedRoles(visibleTo)
  }, [visibleTo])

  // Calculate dropdown position when opening
  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 300 // Approximate max height
      
      // Position below if enough space, otherwise above
      if (spaceBelow >= dropdownHeight || spaceBelow >= rect.top) {
        setDropdownPosition({
          top: rect.bottom + 4,
          left: Math.max(8, Math.min(rect.left, window.innerWidth - 220)),
        })
      } else {
        setDropdownPosition({
          top: rect.top - dropdownHeight - 4,
          left: Math.max(8, Math.min(rect.left, window.innerWidth - 220)),
        })
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [isOpen, updateDropdownPosition])

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleToggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      // Don't allow removing the last role
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== roleName))
      }
    } else {
      setSelectedRoles([...selectedRoles, roleName])
    }
  }

  const handleSave = () => {
    if (selectedRoles.length > 0) {
      updateVisibility.mutate({ id: documentId, visible_to: selectedRoles })
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedRoles(visibleTo) // Reset to original
    setIsOpen(false)
  }

  const formatRoleName = (roleName: string) => {
    const role = roles.find(r => r.name === roleName)
    return role?.display_name || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Dropdown content rendered via portal
  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-divider rounded-lg shadow-2xl min-w-[220px] max-h-[300px] overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-b border-divider bg-surface">
        <p className="text-xs font-medium text-text-secondary">Select visible roles</p>
      </div>
      {isLoading ? (
        <div className="px-4 py-3 text-text-secondary text-sm">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="px-4 py-3 text-text-secondary text-sm">No roles available</div>
      ) : (
        <>
          <div className="max-h-[180px] overflow-y-auto">
            {roles.map(role => (
              <button
                key={role.name}
                type="button"
                onClick={() => handleToggleRole(role.name)}
                className={`
                  w-full px-3 py-2.5 text-left flex items-center justify-between
                  hover:bg-surface transition-colors text-sm
                  ${selectedRoles.includes(role.name) ? 'bg-primary/5' : ''}
                `}
              >
                <span className="text-text-primary">{role.display_name}</span>
                {selectedRoles.includes(role.name) && (
                  <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          {/* Action buttons */}
          <div className="border-t border-divider p-2 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 text-text-secondary text-sm rounded-lg hover:bg-surface transition-colors border border-divider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateVisibility.isPending}
              className="flex-1 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {updateVisibility.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  ) : null

  // Mobile view - compact button
  if (isMobile) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
        >
          <PencilIcon className="w-3 h-3" />
          <span>Edit visibility</span>
        </button>
        {dropdownContent}
      </>
    )
  }

  // Desktop view - show role badges
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex flex-wrap gap-1 items-center cursor-pointer group min-w-[150px] hover:bg-surface/50 rounded p-1 -m-1 transition-colors"
      >
        {selectedRoles.slice(0, 2).map(role => (
          <span
            key={role}
            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
          >
            {formatRoleName(role)}
          </span>
        ))}
        {selectedRoles.length > 2 && (
          <span className="px-2 py-0.5 bg-gray-100 text-text-secondary text-xs rounded-full">
            +{selectedRoles.length - 2}
          </span>
        )}
        <PencilIcon className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
      </button>
      {dropdownContent}
    </>
  )
}
