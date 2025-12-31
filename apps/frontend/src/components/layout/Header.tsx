import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import type { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { STORAGE_KEYS } from '@5data-hrms/shared'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

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

  return (
    <header className="h-16 bg-white border-b border-divider flex items-center justify-between px-8">
      {/* Left side - Breadcrumb or title will go here */}
      <div />

      {/* Right side - User info and actions */}
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-text-secondary">{user.email}</p>
            </div>
            <UserCircleIcon className="w-8 h-8 text-text-secondary" />
          </>
        )}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-surface rounded-card transition-colors"
          title="Logout"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </header>
  )
}



