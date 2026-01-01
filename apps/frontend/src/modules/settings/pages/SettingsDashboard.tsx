import {
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import SettingsCard from '../components/SettingsCard'
import {
  useDepartmentsCount,
  useLocationsCount,
  useHolidaysCount,
} from '../hooks/useSettings'

export default function SettingsDashboard() {
  const { data: departmentsCount, isLoading: isDepartmentsLoading } = useDepartmentsCount()
  const { data: locationsCount, isLoading: isLocationsLoading } = useLocationsCount()
  const { data: holidaysCount, isLoading: isHolidaysLoading } = useHolidaysCount()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Manage your organization's departments, locations, and holidays
        </p>
      </div>

      {/* Cards Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Departments Card */}
        <SettingsCard
          title="Departments"
          count={departmentsCount}
          isLoading={isDepartmentsLoading}
          href="/settings/departments"
          description="Manage organization departments"
          icon={<BuildingOfficeIcon className="w-7 h-7" />}
        />

        {/* Locations Card */}
        <SettingsCard
          title="Locations"
          count={locationsCount}
          isLoading={isLocationsLoading}
          href="/settings/locations"
          description="Manage office locations"
          icon={<MapPinIcon className="w-7 h-7" />}
        />

        {/* Holidays Card */}
        <SettingsCard
          title="Holidays"
          count={holidaysCount}
          isLoading={isHolidaysLoading}
          href="/settings/holidays"
          description="Manage company holidays"
          icon={<CalendarDaysIcon className="w-7 h-7" />}
        />
      </div>

      {/* Additional Info Section */}
      <div className="bg-surface border border-divider rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Tips</h2>
        <ul className="space-y-3 text-sm text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
            <span>
              <strong className="text-text-primary">Departments</strong> help organize employees and define team structures.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
            <span>
              <strong className="text-text-primary">Locations</strong> define office addresses and can be assigned to employees.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
            <span>
              <strong className="text-text-primary">Holidays</strong> are company-wide days off that affect leave calculations.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

