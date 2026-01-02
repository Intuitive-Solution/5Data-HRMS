import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCreateLeave } from '../hooks/useLeaves'
import type { LeaveType } from '@5data-hrms/shared'

interface ApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
}

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'paid_leave', label: 'Paid Leave' },
  { value: 'sick_leave', label: 'Sick Leave' },
  { value: 'casual_leave', label: 'Casual Leave' },
  { value: 'earned_leave', label: 'Earned Leave' },
  { value: 'unpaid_leave', label: 'Unpaid Leave' },
]

export default function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
  const [formData, setFormData] = useState({
    leave_type: 'paid_leave' as LeaveType,
    start_date: '',
    end_date: '',
    reason: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const createLeave = useCreateLeave()

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.start_date || !formData.end_date) {
      alert('Please select both start and end dates')
      return
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      alert('Start date cannot be after end date')
      return
    }

    try {
      await createLeave.mutateAsync({
        data: formData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      })

      // Reset form and close modal
      setFormData({
        leave_type: 'paid_leave',
        start_date: '',
        end_date: '',
        reason: '',
      })
      setSelectedFiles([])
      onClose()
    } catch (error) {
      console.error('Failed to create leave:', error)
      alert('Failed to create leave request. Please try again.')
    }
  }

  return (
    <div className="fixed !mt-0 inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider p-6">
          <h2 className="text-xl font-semibold text-text-primary">Apply Leave</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Leave Type *
            </label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              className="input-field"
            >
              {LEAVE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          </div>

          {/* Reason/Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter leave reason or description"
              rows={4}
              className="input-field"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-divider rounded-lg p-4 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer block"
              >
                <p className="text-sm text-text-secondary">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-text-primary">Selected Files:</p>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-surface rounded-lg p-3"
                  >
                    <p className="text-sm text-text-primary">{file.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {createLeave.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              Failed to create leave request. Please try again.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-divider">
            <button
              type="submit"
              disabled={createLeave.isPending}
              className="btn-primary"
            >
              {createLeave.isPending ? 'Creating...' : 'Apply Leave'}
            </button>
            <button
              type="button"
              onClick={onClose}
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

