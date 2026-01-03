/**
 * Documents module exports
 */

// Pages
export { default as DocumentListPage } from './pages/DocumentListPage'

// Components
export { default as DocumentsTable } from './components/DocumentsTable'
export { default as UploadDocumentModal } from './components/UploadDocumentModal'
export { default as RoleMultiSelect } from './components/RoleMultiSelect'
export { default as DocumentActions } from './components/DocumentActions'
export { default as FileTypeIcon } from './components/FileTypeIcon'
export { default as VisibleToCell } from './components/VisibleToCell'

// Hooks
export * from './hooks/useDocuments'

// Services
export { documentApi } from './services/documentApi'

// Types
export type * from './types'

