import { useRef, useState } from 'react'
import { useEmployeeDocuments, useUploadDocument, useDeleteDocument } from '../hooks/useEmployees'
import type { EmployeeDetail } from '@5data-hrms/shared'
import { PlusIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface DocumentsTabProps {
  employee: EmployeeDetail
  canEdit: boolean
}

export default function DocumentsTab({ employee, canEdit }: DocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('other')

  const { data: documents, isLoading } = useEmployeeDocuments(employee.id)
  const uploadDocument = useUploadDocument(employee.id)
  const deleteDocument = useDeleteDocument(employee.id)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fileInputRef.current?.files?.[0]) {
      alert('Please select a file')
      return
    }

    if (!documentName.trim()) {
      alert('Please enter document name')
      return
    }

    try {
      await uploadDocument.mutateAsync({
        name: documentName,
        document_type: documentType,
        file: fileInputRef.current.files[0],
      })

      // Reset form
      setDocumentName('')
      setDocumentType('other')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument.mutate(docId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {canEdit && (
        <div className="bg-surface p-6 rounded-card border border-divider">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Document</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g., Passport, Degree Certificate"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="input-field"
                >
                  <option value="passport">Passport</option>
                  <option value="id_proof">ID Proof</option>
                  <option value="degree">Degree</option>
                  <option value="certificate">Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                File
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="flex-1 input-field"
                />
                <button
                  type="submit"
                  disabled={uploadDocument.isPending}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4" />
                  {uploadDocument.isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Documents</h3>
        {isLoading ? (
          <p className="text-text-secondary">Loading documents...</p>
        ) : !documents || documents.length === 0 ? (
          <p className="text-text-secondary">No documents uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-surface rounded-card border border-divider hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <DocumentIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-secondary bg-white px-2 py-1 rounded">
                        {doc.document_type}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {doc.uploaded_by_name}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <a
                    href={doc.file}
                    download
                    className="px-4 py-2 text-primary text-sm font-medium hover:bg-surface rounded-card transition-colors"
                  >
                    Download
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 hover:bg-white rounded-card transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

