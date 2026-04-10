// ---------------------------------------------------------------------------
// TanStack Query hooks for Agents — CRUD
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { Agent } from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const agentKeys = {
  all: ['agents'] as const,
  detail: (id: string) => ['agents', id] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all agents for the current user, ordered by name */
export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: agentKeys.all,
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) throw error
      return (data ?? []) as Agent[]
    },
  })
}

/** Fetch a single agent by ID */
export function useAgent(id: string | null) {
  return useQuery<Agent | null>({
    queryKey: id ? agentKeys.detail(id) : ['agents', 'none'],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Agent
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new agent */
export function useCreateAgent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      name: string
      slug?: string | null
      role?: string | null
      tier?: Agent['tier']
      platform?: string | null
      avatar_emoji?: string
      system_prompt?: string
      model?: string
      mcp_servers?: string[]
      status?: string
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('agents')
        .insert({
          user_id: userId,
          name: input.name,
          slug: input.slug ?? null,
          role: input.role ?? null,
          tier: input.tier ?? 'ic',
          platform: input.platform ?? null,
          avatar_emoji: input.avatar_emoji ?? '🤖',
          system_prompt: input.system_prompt ?? '',
          model: input.model ?? 'Sonnet 4.6',
          mcp_servers: input.mcp_servers ?? [],
          status: input.status ?? 'idle',
        })
        .select()
        .single()

      if (error) throw error
      return data as Agent
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.all })
    },
  })
}

/** Update an existing agent */
export function useUpdateAgent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at'>>) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('agents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Agent
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: agentKeys.all })
      qc.invalidateQueries({ queryKey: agentKeys.detail(variables.id) })
    },
  })
}

/** Delete an agent */
export function useDeleteAgent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.all })
    },
  })
}
