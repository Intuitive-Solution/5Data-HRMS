import { useNavigate } from 'react-router-dom'

interface SettingsCardProps {
  title: string
  count: number | undefined
  isLoading: boolean
  href: string
  icon: React.ReactNode
  description?: string
}

export default function SettingsCard({
  title,
  count,
  isLoading,
  href,
  icon,
  description,
}: SettingsCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(href)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${count ?? 0} items. Click to manage ${title.toLowerCase()}`}
      className="group relative bg-white border border-divider rounded-2xl p-6 cursor-pointer
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        active:scale-[0.98]"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 
          flex items-center justify-center text-primary
          group-hover:from-primary group-hover:to-primary-dark group-hover:text-white
          transition-all duration-300">
          {icon}
        </div>
        
        {/* Arrow indicator */}
        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          transform translate-x-2 group-hover:translate-x-0">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-secondary mb-3">{description}</p>
      )}

      {/* Count */}
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-16 bg-surface rounded animate-pulse" />
        ) : (
          <>
            <span className="text-3xl font-bold text-text-primary">
              {count ?? 0}
            </span>
            <span className="text-sm text-text-secondary">
              {count === 1 ? 'item' : 'items'}
            </span>
          </>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark 
        rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  )
}

