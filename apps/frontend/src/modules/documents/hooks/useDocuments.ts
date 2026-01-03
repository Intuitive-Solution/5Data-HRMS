/**
 * React Query hooks for document operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../services/documentApi'
import type { CreateDocumentRequest } from '../types'

const DOCUMENTS_QUERY_KEY = 'documents'

/**
 * Hook to fetch documents with pagination and search
 */
export const useDocuments = (page = 1, search = '', ordering = '-created_at') => {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, page, search, ordering],
    queryFn: () => documentApi.getDocuments(page, search, ordering).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single document by ID
 */
export const useDocument = (id: number | undefined) => {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, id],
    queryFn: () => documentApi.getDocumentById(id!).then(res => res.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to upload a new document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDocumentRequest) =>
      documentApi.uploadDocument(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete a document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to update document visibility (HR/Admin only)
 */
export const useUpdateDocumentVisibility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, visible_to }: { id: number; visible_to: string[] }) =>
      documentApi.updateDocumentVisibility(id, visible_to).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to download a document
 */
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) =>
      documentApi.downloadDocument(id, filename),
  })
}

