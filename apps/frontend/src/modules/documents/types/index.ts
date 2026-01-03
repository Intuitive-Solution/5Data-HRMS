/**
 * TypeScript types for the Documents module
 */

export interface Document {
  id: number
  title: string
  description: string
  file?: string
  file_size: string
  file_type: DocumentFileType
  visible_to: string[]
  uploaded_by?: number
  uploaded_by_name: string
  uploaded_by_email?: string
  created_at: string
  updated_at?: string
}

export type DocumentFileType = 
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'image'
  | 'txt'
  | 'csv'
  | 'zip'
  | 'other'

export interface DocumentListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Document[]
}

export interface CreateDocumentRequest {
  title: string
  description?: string
  file: File
  visible_to: string[]
}

export interface DocumentFilters {
  page?: number
  search?: string
  ordering?: string
}

