import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeftOnRectangleIcon, 
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import type { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { STORAGE_KEYS } from '@5data-hrms/shared'

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const handleLogout = () => {
    // Clear localStorage tokens
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    
    // Clear Redux state
    dispatch(logout())
    
    // Redirect to login
    navigate('/login')
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <header className="h-16 bg-white border-b border-divider flex items-center justify-between px-4">
      {/* Left side - Breadcrumb or title will go here */}
      <div />

      {/* Right side - User info with dropdown */}
      <div className="relative" ref={profileRef}>
        {user && (
          <>
            {/* User info trigger */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-text-primary">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </span>
                </div>
              )}
            </button>

            {/* Profile Dropdown Modal */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-divider overflow-hidden z-50">
                {/* User Avatar & Name */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5">
                  <div className="flex items-center gap-4">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md relative">
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <ShieldCheckIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary truncate">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-sm text-text-secondary truncate flex items-center gap-1 mt-0.5">
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="p-4 space-y-3">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Status</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Roles */}
                  {user.roles && user.roles.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-2">
                        <UserCircleIcon className="w-4 h-4" />
                        <span>Roles</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                          >
                            {formatRole(role)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
}
