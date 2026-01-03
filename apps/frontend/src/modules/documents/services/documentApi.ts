/**
 * API service for document operations
 */
import api from '@/services/api'
import type { Document, DocumentListResponse, CreateDocumentRequest } from '../types'

const DOCUMENTS_BASE_URL = '/documents'

export const documentApi = {
  /**
   * Get all documents with pagination, search, and filtering
   * Documents are filtered by backend based on user's role
   */
  getDocuments: (page = 1, search = '', ordering = '-created_at') => {
    const params = new URLSearchParams({
      page: page.toString(),
      ordering,
    })
    if (search) {
      params.append('search', search)
    }
    return api.get<DocumentListResponse>(`${DOCUMENTS_BASE_URL}/?${params}`)
  },

  /**
   * Get document by ID
   */
  getDocumentById: (id: number) => {
    return api.get<Document>(`${DOCUMENTS_BASE_URL}/${id}/`)
  },

  /**
   * Upload a new document (admin/hr only)
   */
  uploadDocument: (data: CreateDocumentRequest) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('file', data.file)
    formData.append('visible_to', JSON.stringify(data.visible_to))
    if (data.description) {
      formData.append('description', data.description)
    }
    
    return api.post<Document>(`${DOCUMENTS_BASE_URL}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Delete document (soft delete, admin/hr only)
   */
  deleteDocument: (id: number) => {
    return api.delete(`${DOCUMENTS_BASE_URL}/${id}/`)
  },

  /**
   * Update document visibility (admin/hr only)
   */
  updateDocumentVisibility: (id: number, visible_to: string[]) => {
    return api.patch<Document>(`${DOCUMENTS_BASE_URL}/${id}/`, { visible_to })
  },

  /**
   * Get download URL for a document
   * The backend checks role-based visibility
   */
  getDownloadUrl: (id: number) => {
    return `${api.defaults.baseURL}${DOCUMENTS_BASE_URL}/${id}/download/`
  },

  /**
   * Download document file
   */
  downloadDocument: async (id: number, filename: string) => {
    const response = await api.get(`${DOCUMENTS_BASE_URL}/${id}/download/`, {
      responseType: 'blob',
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

