// ---------------------------------------------------------------------------
// TanStack Query hooks for Venture Files — CRUD
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { VentureFile } from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const ventureFileKeys = {
  all: ['venture-files'] as const,
  byVenture: (ventureId: string) => ['venture-files', ventureId] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all files for a venture, ordered by sort_order */
export function useVentureFiles(ventureId: string | null) {
  return useQuery<VentureFile[]>({
    queryKey: ventureId ? ventureFileKeys.byVenture(ventureId) : ['venture-files', 'none'],
    enabled: !!ventureId,
    queryFn: async () => {
      if (!ventureId) return []
      const { data, error } = await supabase
        .from('venture_files')
        .select('*')
        .eq('venture_id', ventureId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return (data ?? []) as VentureFile[]
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new venture file */
export function useCreateVentureFile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      venture_id: string
      label: string
      file_type: VentureFile['file_type']
      url: string
      mime_type?: string | null
      file_size?: number | null
      sort_order?: number
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('venture_files')
        .insert({
          user_id: userId,
          venture_id: input.venture_id,
          label: input.label,
          file_type: input.file_type,
          url: input.url,
          mime_type: input.mime_type ?? null,
          file_size: input.file_size ?? null,
          sort_order: input.sort_order ?? 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as VentureFile
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ventureFileKeys.byVenture(variables.venture_id) })
    },
  })
}

/** Update a venture file */
export function useUpdateVentureFile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; venture_id: string } & Partial<Omit<VentureFile, 'id' | 'venture_id' | 'created_at'>>) => {
      const { id, venture_id, ...updates } = input
      const { data, error } = await supabase
        .from('venture_files')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as VentureFile
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ventureFileKeys.byVenture(variables.venture_id) })
    },
  })
}

/** Delete a venture file */
export function useDeleteVentureFile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; venture_id: string }) => {
      const { error } = await supabase
        .from('venture_files')
        .delete()
        .eq('id', input.id)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ventureFileKeys.byVenture(variables.venture_id) })
    },
  })
}
