// ---------------------------------------------------------------------------
// TanStack Query hooks for Ventures — CRUD, links, auto-setup
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { Venture, VentureLink } from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const ventureKeys = {
  all: ['ventures'] as const,
  detail: (id: string) => ['ventures', id] as const,
  links: (ventureId: string) => ['ventures', ventureId, 'links'] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all ventures for the current user, ordered by most recently updated */
export function useVenturesQuery() {
  return useQuery<Venture[]>({
    queryKey: ventureKeys.all,
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as Venture[]
    },
  })
}

/** Fetch a single venture by ID */
export function useVenture(id: string | null) {
  return useQuery<Venture | null>({
    queryKey: id ? ventureKeys.detail(id) : ['ventures', 'none'],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Venture
    },
  })
}

/** Structured links derived from venture_links rows */
export interface VentureLinksMap {
  live_url: string | null
  github_url: string | null
  docs_url: string | null
}

/** Fetch venture links and convert to a typed map */
export function useVentureLinks(ventureId: string | null) {
  return useQuery<VentureLinksMap>({
    queryKey: ventureId ? ventureKeys.links(ventureId) : ['ventures', 'none', 'links'],
    enabled: !!ventureId,
    queryFn: async () => {
      if (!ventureId) return { live_url: null, github_url: null, docs_url: null }

      const { data, error } = await supabase
        .from('venture_links')
        .select('*')
        .eq('venture_id', ventureId)

      if (error) throw error

      const rows = (data ?? []) as VentureLink[]
      const map: VentureLinksMap = { live_url: null, github_url: null, docs_url: null }
      for (const link of rows) {
        if (link.label === 'live_url') map.live_url = link.url
        else if (link.label === 'github_url') map.github_url = link.url
        else if (link.label === 'docs_url') map.docs_url = link.url
      }
      return map
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new venture (auto-creates root org node + founder node) */
export function useCreateVenture() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      name: string
      description?: string
      stage?: Venture['stage']
      primary_color?: string
      secondary_color?: string
      logo_emoji?: string
    }) => {
      const userId = await getCurrentUserId()

      // 1. Insert venture
      const { data: venture, error } = await supabase
        .from('ventures')
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description ?? null,
          stage: input.stage ?? 'idea',
          primary_color: input.primary_color ?? '#818CF8',
          secondary_color: input.secondary_color ?? '#6366F1',
          logo_emoji: input.logo_emoji ?? null,
        })
        .select()
        .single()

      if (error) throw error

      // 2. Auto-create root org node
      const { data: rootNode, error: rootErr } = await supabase
        .from('venture_org_nodes')
        .insert({
          venture_id: venture.id,
          entity_type: 'root' as const,
          name_override: input.name,
          role_override: 'Organization',
          sort_order: 0,
        })
        .select()
        .single()

      if (rootErr) throw rootErr

      // 3. Auto-create founder node for current user
      const { error: founderErr } = await supabase
        .from('venture_org_nodes')
        .insert({
          venture_id: venture.id,
          parent_node_id: rootNode.id,
          entity_type: 'human' as const,
          name_override: 'Founder',
          role_override: 'Founder',
          sort_order: 0,
        })

      if (founderErr) throw founderErr

      return venture as Venture
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ventureKeys.all })
    },
  })
}

/** Update an existing venture */
export function useUpdateVenture() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Omit<Venture, 'id' | 'created_at' | 'updated_at'>>) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('ventures')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Venture
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ventureKeys.all })
      qc.invalidateQueries({ queryKey: ventureKeys.detail(variables.id) })
    },
  })
}

/** Delete a venture with optimistic update */
export function useDeleteVenture() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ventures')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ventureKeys.all })

      const previous = qc.getQueryData<Venture[]>(ventureKeys.all)
      qc.setQueryData<Venture[]>(ventureKeys.all, (old) =>
        (old ?? []).filter((v) => v.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(ventureKeys.all, context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ventureKeys.all })
    },
  })
}

/** Delete existing links and re-insert new ones */
export function useUpdateVentureLinks() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      venture_id: string
      live_url?: string | null
      github_url?: string | null
      docs_url?: string | null
    }) => {
      // Delete existing links
      const { error: delErr } = await supabase
        .from('venture_links')
        .delete()
        .eq('venture_id', input.venture_id)

      if (delErr) throw delErr

      // Build new link rows
      const rows: { venture_id: string; url: string; label: string; sort_order: number }[] = []
      if (input.live_url) rows.push({ venture_id: input.venture_id, url: input.live_url, label: 'live_url', sort_order: 0 })
      if (input.github_url) rows.push({ venture_id: input.venture_id, url: input.github_url, label: 'github_url', sort_order: 1 })
      if (input.docs_url) rows.push({ venture_id: input.venture_id, url: input.docs_url, label: 'docs_url', sort_order: 2 })

      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from('venture_links')
          .insert(rows)

        if (insErr) throw insErr
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ventureKeys.links(variables.venture_id) })
    },
  })
}
