/**
 * Documents List Page
 * 
 * Displays company documents with role-based visibility.
 * UI matches the Projects page layout and styling.
 */
import { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useIsHROrAdmin } from '@/hooks/useAuth'
import { useDocuments } from '../hooks/useDocuments'
import DocumentsTable from '../components/DocumentsTable'
import UploadDocumentModal from '../components/UploadDocumentModal'

export default function DocumentListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  const isHROrAdmin = useIsHROrAdmin()
  const { data, isLoading, error } = useDocuments(page, search, ordering)

  const handleSort = (field: string) => {
    setPage(1)
    if (ordering === field) {
      setOrdering(`-${field}`)
    } else if (ordering === `-${field}`) {
      setOrdering(field)
    } else {
      setOrdering(field)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading documents</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Documents</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Company policies, forms, and shared files
          </p>
        </div>
        {isHROrAdmin && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            Upload Document
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-3 border border-divider rounded-card px-4 py-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, description, or uploader..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary min-w-0"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="card">
        <DocumentsTable
          documents={data?.results || []}
          isLoading={isLoading}
          isHROrAdmin={isHROrAdmin}
          ordering={ordering}
          onSort={handleSort}
        />
      </div>

      {/* Pagination */}
      {data && data.count > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.count)} of{' '}
            {data.count} documents
          </p>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous}
              className="px-4 py-2 border border-divider rounded-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors flex-1 sm:flex-none"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next}
              className="px-4 py-2 border border-divider rounded-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors flex-1 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  )
}

