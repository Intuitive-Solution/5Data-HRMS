/**
 * Modal for uploading documents with drag & drop support
 */
import { useState, useRef, useCallback } from 'react'
import { XMarkIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useUploadDocument } from '../hooks/useDocuments'
import RoleMultiSelect from './RoleMultiSelect'

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadDocument = useUploadDocument()

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setSelectedRoles([])
    setFile(null)
    setErrors({})
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!file) {
      newErrors.file = 'Please select a file to upload'
    }
    
    if (selectedRoles.length === 0) {
      newErrors.visible_to = 'Please select at least one role'
    }
    
    if (description.length > 250) {
      newErrors.description = 'Description must be 250 characters or less'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate() || !file) return
    
    try {
      await uploadDocument.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        file,
        visible_to: selectedRoles,
      })
      
      handleClose()
    } catch (error) {
      console.error('Failed to upload document:', error)
    }
  }

  // Handle ESC key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed !mt-0 inset-0 bg-black/40 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider p-6">
          <h2 className="text-xl font-semibold text-text-primary">Upload Document</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-surface rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              File *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : errors.file 
                    ? 'border-red-300 hover:border-red-400' 
                    : 'border-divider hover:border-primary'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,.zip,.rar"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <DocumentIcon className="w-10 h-10 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-text-primary">{file.name}</p>
                    <p className="text-sm text-text-secondary">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, TXT, CSV, ZIP
                  </p>
                </>
              )}
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leave Policy 2025"
              className={`input-field ${errors.title ? 'border-red-300' : ''}`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Visible To */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Visible To *
            </label>
            <RoleMultiSelect
              selectedRoles={selectedRoles}
              onChange={setSelectedRoles}
            />
            {errors.visible_to && (
              <p className="mt-1 text-sm text-red-500">{errors.visible_to}</p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Select which roles can view and download this document
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
              <span className="text-text-secondary font-normal ml-1">
                ({description.length}/250)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document..."
              rows={3}
              maxLength={250}
              className={`input-field ${errors.description ? 'border-red-300' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Error Message */}
          {uploadDocument.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              Failed to upload document. Please try again.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-divider">
            <button
              type="submit"
              disabled={uploadDocument.isPending}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {uploadDocument.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Upload Document
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={uploadDocument.isPending}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

