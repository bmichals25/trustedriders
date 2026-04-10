// ---------------------------------------------------------------------------
// TanStack Query hooks for Missions + Mission KPIs
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { Mission, MissionKPI } from '@/types'

// ---------------------------------------------------------------------------
// Exported composite type
// ---------------------------------------------------------------------------

export type MissionWithKPIs = Mission & { mission_kpis: MissionKPI[] }

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const missionKeys = {
  all: ['missions'] as const,
  byVenture: (ventureId: string) => ['missions', 'venture', ventureId] as const,
  detail: (id: string) => ['missions', id] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all missions for a venture with their nested KPIs */
export function useMissions(ventureId: string | null) {
  return useQuery<MissionWithKPIs[]>({
    queryKey: ventureId ? missionKeys.byVenture(ventureId) : ['missions', 'venture', 'none'],
    enabled: !!ventureId,
    queryFn: async () => {
      if (!ventureId) return []
      const { data, error } = await supabase
        .from('missions')
        .select('*, mission_kpis(*)')
        .eq('venture_id', ventureId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return (data ?? []) as MissionWithKPIs[]
    },
  })
}

// ---------------------------------------------------------------------------
// Mission Mutations
// ---------------------------------------------------------------------------

/** Create a new mission */
export function useCreateMission() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      venture_id: string
      name: string
      description?: string | null
      type?: Mission['type']
      owner_node_id?: string | null
      orchestrator_node_id?: string | null
      loop_enabled?: boolean
      goal_metric?: string | null
      goal_value?: number | null
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('missions')
        .insert({
          user_id: userId,
          venture_id: input.venture_id,
          name: input.name,
          description: input.description ?? null,
          type: input.type ?? 'product',
          owner_node_id: input.owner_node_id ?? null,
          orchestrator_node_id: input.orchestrator_node_id ?? null,
          loop_enabled: input.loop_enabled ?? false,
          goal_metric: input.goal_metric ?? null,
          goal_value: input.goal_value ?? null,
        })
        .select('*, mission_kpis(*)')
        .single()

      if (error) throw error
      return data as MissionWithKPIs
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: missionKeys.byVenture(variables.venture_id) })
    },
  })
}

/** Partial update of a mission */
export function useUpdateMission() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Omit<Mission, 'id' | 'created_at' | 'updated_at'>>) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('missions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, mission_kpis(*)')
        .single()

      if (error) throw error
      return data as MissionWithKPIs
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: missionKeys.byVenture(data.venture_id) })
    },
  })
}

// ---------------------------------------------------------------------------
// KPI Mutations
// ---------------------------------------------------------------------------

/** Create a KPI for a mission */
export function useCreateKPI() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      mission_id: string
      label: string
      target_val?: number | null
      unit?: string
    }) => {
      const { data, error } = await supabase
        .from('mission_kpis')
        .insert({
          mission_id: input.mission_id,
          label: input.label,
          target_val: input.target_val ?? null,
          unit: input.unit ?? '',
        })
        .select()
        .single()

      if (error) throw error
      return data as MissionKPI
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

/** Update a KPI */
export function useUpdateKPI() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Omit<MissionKPI, 'id' | 'mission_id'>>) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('mission_kpis')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as MissionKPI
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

/** Delete a KPI */
export function useDeleteKPI() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mission_kpis')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}
