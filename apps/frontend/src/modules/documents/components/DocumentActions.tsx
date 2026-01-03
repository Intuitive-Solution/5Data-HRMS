/**
 * Action icons for document table rows (download, delete)
 * Icons are colorful: download is green, delete is red
 */
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline'

interface DocumentActionsProps {
  onDownload: () => void
  onDelete?: () => void
  isDownloading?: boolean
  canDelete: boolean
}

export default function DocumentActions({
  onDownload,
  onDelete,
  isDownloading = false,
  canDelete,
}: DocumentActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Download button - Green */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDownload()
        }}
        disabled={isDownloading}
        className="p-2 hover:bg-green-50 rounded-card transition-colors group"
        title="Download"
      >
        {isDownloading ? (
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowDownTrayIcon className="w-4 h-4 text-green-600 group-hover:text-green-700 transition-colors" />
        )}
      </button>

      {/* Delete button - Red (admin/hr only) */}
      {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 hover:bg-red-50 rounded-card transition-colors group"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
        </button>
      )}
    </div>
  )
}
