// ---------------------------------------------------------------------------
// TanStack Query hooks for Agent Dispatches — fetch, create, realtime
// ---------------------------------------------------------------------------

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DbAgentDispatch {
  id: string
  agent_id: string
  task_id: string | null
  venture_id: string
  wave_id: string | null
  org_node_id: string | null
  status: string
  prompt: string | null
  context: string | null
  result: string | null
  model_used: string | null
  advisor_calls: number
  model_tier: string
  started_at: string | null
  completed_at: string | null
  created_at: string
  // Joined agent fields
  agent_name: string | null
  agent_slug: string | null
  agent_avatar_emoji: string | null
  agent_platform: string | null
}

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const dispatchKeys = {
  all: ['dispatches'] as const,
  byVenture: (ventureId: string) => ['dispatches', 'venture', ventureId] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch dispatches for a venture, joined with agents table */
export function useAgentDispatches(ventureId: string | null) {
  const qc = useQueryClient()

  const query = useQuery<DbAgentDispatch[]>({
    queryKey: ventureId ? dispatchKeys.byVenture(ventureId) : ['dispatches', 'venture', 'none'],
    enabled: !!ventureId,
    queryFn: async () => {
      if (!ventureId) return []
      const { data, error } = await supabase
        .from('agent_dispatches')
        .select(`
          *,
          agents!agent_id (
            name,
            slug,
            avatar_emoji,
            platform
          )
        `)
        .eq('venture_id', ventureId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Flatten the joined agent data
      return (data ?? []).map((row: Record<string, unknown>) => {
        const agent = row.agents as Record<string, unknown> | null
        return {
          ...row,
          agent_name: agent?.name ?? null,
          agent_slug: agent?.slug ?? null,
          agent_avatar_emoji: agent?.avatar_emoji ?? null,
          agent_platform: agent?.platform ?? null,
          agents: undefined,
        } as DbAgentDispatch
      })
    },
  })

  // Realtime subscription for dispatch status changes
  useEffect(() => {
    if (!ventureId) return

    const channel = supabase
      .channel(`dispatches:venture:${ventureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_dispatches',
          filter: `venture_id=eq.${ventureId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: dispatchKeys.byVenture(ventureId) })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ventureId, qc])

  return query
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new agent dispatch */
export function useDispatchAgent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      agent_id: string
      venture_id: string
      task_id?: string | null
      wave_id?: string | null
      org_node_id?: string | null
      prompt?: string | null
      context?: string | null
      model_used?: string | null
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('agent_dispatches')
        .insert({
          user_id: userId,
          agent_id: input.agent_id,
          venture_id: input.venture_id,
          task_id: input.task_id ?? null,
          wave_id: input.wave_id ?? null,
          org_node_id: input.org_node_id ?? null,
          status: 'queued',
          prompt: input.prompt ?? null,
          context: input.context ?? null,
          model_used: input.model_used ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: dispatchKeys.byVenture(variables.venture_id) })
    },
  })
}
