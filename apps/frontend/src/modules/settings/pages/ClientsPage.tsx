import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '../hooks/useSettings'
import type { Client, CreateClientRequest, EntityStatus } from '@5data-hrms/shared'
import { useFormValidation, type FieldRules } from '@/utils/validation'

const clientValidationRules: FieldRules = {
  code: [
    { type: 'required', message: 'Client code is required' },
    { type: 'minLength', value: 2, message: 'Code must be at least 2 characters' },
  ],
  name: [
    { type: 'required', message: 'Client name is required' },
    { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
  ],
  email: [{ type: 'email', message: 'Please enter a valid email address' }],
  phone: [{ type: 'phone', message: 'Please enter a valid phone number (e.g., +1 234 567 8900)' }],
}

const initialFormData: CreateClientRequest = {
  code: '',
  name: '',
  description: '',
  address: '',
  contact_person: '',
  person_name: '',
  email: '',
  phone: '',
  status: 'active' as EntityStatus,
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    data: formData,
    errors: formErrors,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setFormData,
    getFieldProps,
  } = useFormValidation<CreateClientRequest>(initialFormData, clientValidationRules)

  const { data, isLoading, error } = useClients(page, search, ordering)

  const handleSort = (field: string) => {
    setPage(1)
    if (ordering === field) {
      setOrdering(`-${field}`)
    } else if (ordering === `-${field}`) {
      setOrdering('')
    } else {
      setOrdering(field)
    }
  }

  const isSorted = (field: string) => ordering === field || ordering === `-${field}`
  const isSortedDesc = (field: string) => ordering === `-${field}`

  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const openCreateModal = () => {
    setEditingClient(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setFormData({
      code: client.code,
      name: client.name,
      description: client.description || '',
      address: client.address || '',
      contact_person: client.contact_person || '',
      person_name: client.person_name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return

    try {
      if (editingClient) {
        // Ensure required fields are present
        const updateData = {
          ...formData,
          code: formData.code || editingClient.code,
          name: formData.name || editingClient.name,
        }
        await updateClient.mutateAsync({
          id: editingClient.id,
          data: updateData,
        })
        setSuccessMessage('Client updated successfully')
      } else {
        await createClient.mutateAsync(formData)
        setSuccessMessage('Client created successfully')
      }
      closeModal()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save client:', err)
    }
  }

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete "${client.name}"?`)) {
      try {
        await deleteClient.mutateAsync(client.id)
        setSuccessMessage('Client deleted successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err) {
        console.error('Failed to delete client:', err)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-surface rounded-lg transition-colors mt-1"
            aria-label="Back to settings"
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Clients</h1>
            <p className="text-text-secondary mt-1 text-sm sm:text-base">
              Manage client organizations
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusIcon className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3 border border-divider rounded-lg px-4 py-3 flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary min-w-0"
            />
          </div>

          {/* Mobile sort */}
          <div className="sm:hidden">
            <label htmlFor="client-sort" className="sr-only">
              Sort clients
            </label>
            <select
              id="client-sort"
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors bg-white text-text-primary"
            >
              <option value="">Sort: Default</option>
              <option value="code">Sort: Code (A–Z)</option>
              <option value="-code">Sort: Code (Z–A)</option>
              <option value="name">Sort: Name (A–Z)</option>
              <option value="-name">Sort: Name (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-text-secondary mt-4">Loading clients...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading clients</p>
          </div>
        ) : !data?.results || data.results.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No clients found</p>
            <button onClick={openCreateModal} className="mt-4 text-primary hover:underline">
              Create your first client
            </button>
          </div>
        ) : (
          <>
            {/* Mobile / Tablet card list */}
            <div className="md:hidden space-y-3">
              {data.results.map((client) => (
                <div
                  key={client.id}
                  className="border border-divider rounded-xl p-4 bg-white hover:bg-surface transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface text-text-secondary">
                          {client.code}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            client.status === 'inactive'
                              ? 'bg-gray-100 text-text-secondary'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {client.status || 'active'}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-text-primary truncate">
                        {client.name}
                      </h3>
                      {client.description ? (
                        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                          {client.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        aria-label={`Edit ${client.name}`}
                      >
                        <PencilIcon className="w-5 h-5 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${client.name}`}
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-text-secondary">Address</dt>
                      <dd className="text-text-primary text-right min-w-0 break-words">
                        {client.address || '-'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-text-secondary">Contact Person</dt>
                      <dd className="text-text-primary text-right min-w-0 break-words">
                        {client.contact_person || '-'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-text-secondary">Person Name</dt>
                      <dd className="text-text-primary text-right min-w-0 break-words">
                        {client.person_name || '-'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-text-secondary">Email</dt>
                      <dd className="text-text-primary text-right min-w-0 break-words">
                        {client.email || '-'}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-text-secondary">Phone</dt>
                      <dd className="text-text-primary text-right min-w-0 break-words">
                        {client.phone || '-'}
                      </dd>
                    </div>
                  </dl>
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
                      onClick={() => handleSort('code')}
                      scope="col"
                    >
                      <div className="flex items-center gap-2">
                        <span>Code</span>
                        <ChevronUpDownIcon
                          className={`w-4 h-4 ${
                            isSorted('code')
                              ? 'text-primary'
                              : 'text-text-secondary opacity-0 group-hover:opacity-100'
                          }`}
                        />
                        {isSorted('code') && (
                          <span className="text-xs text-primary">
                            {isSortedDesc('code') ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-text-primary cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => handleSort('name')}
                      scope="col"
                    >
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <ChevronUpDownIcon
                          className={`w-4 h-4 ${
                            isSorted('name')
                              ? 'text-primary'
                              : 'text-text-secondary opacity-0 group-hover:opacity-100'
                          }`}
                        />
                        {isSorted('name') && (
                          <span className="text-xs text-primary">
                            {isSortedDesc('name') ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary" scope="col">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary" scope="col">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary" scope="col">
                      Contact Person
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary" scope="col">
                      Person Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary" scope="col">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary" scope="col">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-divider hover:bg-surface transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-text-secondary">{client.code}</td>
                      <td className="px-6 py-4 text-sm text-text-primary font-medium">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {client.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{client.address || '-'}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {client.contact_person || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {client.person_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{client.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{client.phone || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            aria-label={`Edit ${client.name}`}
                          >
                            <PencilIcon className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${client.name}`}
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.count > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.count)} of {data.count}{' '}
            clients
          </p>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!data.previous}
              className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors w-full sm:w-auto"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.next}
              className="px-4 py-2 border border-divider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors w-full sm:w-auto"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 !mt-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-divider">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingClient ? 'Edit Client' : 'Add Client'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  onBlur={() => handleBlur('code')}
                  {...getFieldProps('code')}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.code ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                  placeholder="Enter client code"
                />
                {formErrors.code && (
                  <p id="code-error" role="alert" className="mt-1 text-sm text-red-500">
                    {formErrors.code}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  {...getFieldProps('name')}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.name ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                  placeholder="Enter client name"
                />
                {formErrors.name && (
                  <p id="name-error" role="alert" className="mt-1 text-sm text-red-500">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Enter client description (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Enter client address (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="contact_person"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contact_person"
                  value={formData.contact_person || ''}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors"
                  placeholder="Enter contact person (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="person_name"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Person Name
                </label>
                <input
                  type="text"
                  id="person_name"
                  value={formData.person_name || ''}
                  onChange={(e) => handleChange('person_name', e.target.value)}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors"
                  placeholder="Enter person name (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  {...getFieldProps('email')}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.email ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                  placeholder="Enter email (optional)"
                />
                {formErrors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-sm text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  {...getFieldProps('phone')}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors
                    ${formErrors.phone ? 'border-red-500' : 'border-divider focus:border-primary'}`}
                  placeholder="+1 234 567 8900"
                />
                {formErrors.phone && (
                  <p id="phone-error" role="alert" className="mt-1 text-sm text-red-500">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value as EntityStatus)}
                  className="w-full px-4 py-3 border border-divider rounded-lg outline-none focus:border-primary transition-colors bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-divider rounded-lg hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClient.isPending || updateClient.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createClient.isPending || updateClient.isPending
                    ? 'Saving...'
                    : editingClient
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}