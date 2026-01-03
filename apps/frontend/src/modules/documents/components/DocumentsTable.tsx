/**
 * Documents table component with desktop table and mobile cards
 */
import { useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import type { Document } from '../types'
import FileTypeIcon from './FileTypeIcon'
import DocumentActions from './DocumentActions'
import VisibleToCell from './VisibleToCell'
import { useDownloadDocument, useDeleteDocument } from '../hooks/useDocuments'

interface DocumentsTableProps {
  documents: Document[]
  isLoading: boolean
  isHROrAdmin: boolean
  ordering: string
  onSort: (field: string) => void
}

export default function DocumentsTable({
  documents,
  isLoading,
  isHROrAdmin,
  ordering,
  onSort,
}: DocumentsTableProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const downloadDocument = useDownloadDocument()
  const deleteDocument = useDeleteDocument()

  const isSorted = (field: string) => {
    return ordering === field || ordering === `-${field}`
  }

  const isSortedDesc = (field: string) => {
    return ordering === `-${field}`
  }

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id)
    try {
      await downloadDocument.mutateAsync({
        id: doc.id,
        filename: doc.title + '.' + doc.file_type,
      })
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download document. You may not have permission.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = (doc: Document) => {
    if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      deleteDocument.mutate(doc.id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const formatRoles = (roles: string[]) => {
    return roles.map(role => 
      role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ')
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-divider rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No documents found</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-divider rounded-xl p-4 bg-white hover:bg-surface transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 bg-surface rounded-lg">
                  <FileTypeIcon fileType={doc.file_type} className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-text-primary truncate">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {doc.file_size} • {doc.uploaded_by_name}
                  </p>
                  {doc.description && (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              <DocumentActions
                onDownload={() => handleDownload(doc)}
                onDelete={isHROrAdmin ? () => handleDelete(doc) : undefined}
                isDownloading={downloadingId === doc.id}
                canDelete={isHROrAdmin}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-text-secondary">
              <span>{formatDate(doc.created_at)}</span>
              {isHROrAdmin && (
                <VisibleToCell 
                  documentId={doc.id} 
                  visibleTo={doc.visible_to}
                  isMobile={true}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block table-container">
        <table className="table-sticky-col">
          <thead>
            <tr className="border-b border-divider bg-surface">
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-2">
                  <span>Document</span>
                  <ChevronUpDownIcon
                    className={`w-4 h-4 ${isSorted('title') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`}
                  />
                  {isSorted('title') && (
                    <span className="text-xs">{isSortedDesc('title') ? '↓' : '↑'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Size
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Uploaded By
              </th>
              {isHROrAdmin && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Visible To
                </th>
              )}
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => onSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  <span>Created At</span>
                  <ChevronUpDownIcon
                    className={`w-4 h-4 ${isSorted('created_at') ? 'text-primary' : 'text-text-secondary opacity-0 group-hover:opacity-100'}`}
                  />
                  {isSorted('created_at') && (
                    <span className="text-xs">{isSortedDesc('created_at') ? '↓' : '↑'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-divider hover:bg-surface transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface rounded-lg">
                      <FileTypeIcon fileType={doc.file_type} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{doc.title}</p>
                      <p className="text-xs text-text-secondary uppercase">{doc.file_type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {doc.file_size}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary max-w-[200px]">
                  {doc.description ? (
                    <span title={doc.description}>
                      {truncateText(doc.description, 50)}
                    </span>
                  ) : (
                    <span className="text-text-secondary/50">—</span>
                  )}
                </td>
                {/* Uploaded By - Name with email below */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {doc.uploaded_by_name}
                    </p>
                    {doc.uploaded_by_email && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {doc.uploaded_by_email}
                      </p>
                    )}
                  </div>
                </td>
                {/* Visible To - Editable dropdown for HR/Admin */}
                {isHROrAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <VisibleToCell 
                      documentId={doc.id} 
                      visibleTo={doc.visible_to} 
                    />
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-text-secondary">
                  <div>
                    <p>{formatDate(doc.created_at)}</p>
                    <p className="text-xs">{formatTime(doc.created_at)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <DocumentActions
                    onDownload={() => handleDownload(doc)}
                    onDelete={isHROrAdmin ? () => handleDelete(doc) : undefined}
                    isDownloading={downloadingId === doc.id}
                    canDelete={isHROrAdmin}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
