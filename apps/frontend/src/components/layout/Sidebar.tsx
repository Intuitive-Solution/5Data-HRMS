import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  FolderIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UserGroupIcon },
  { name: 'Leaves', href: '/leaves', icon: CalendarDaysIcon },
  { name: 'Timesheets', href: '/timesheets', icon: ClockIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-divider flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-divider">
        <h1 className="text-xl font-bold text-primary">5Data HRMS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-card transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-surface'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

