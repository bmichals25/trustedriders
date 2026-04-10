// ---------------------------------------------------------------------------
// TanStack Query hooks for Team Members — CRUD
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { TeamMember } from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const teamKeys = {
  all: ['team-members'] as const,
  detail: (id: string) => ['team-members', id] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all team members for the current user */
export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: teamKeys.all,
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) throw error
      return (data ?? []) as TeamMember[]
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new team member */
export function useCreateTeamMember() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      name: string
      email?: string | null
      phone?: string | null
      avatar_url?: string | null
      notes?: string | null
      linkedin_url?: string | null
      linkedin_headline?: string | null
      linkedin_cover_url?: string | null
    }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          user_id: userId,
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          avatar_url: input.avatar_url ?? null,
          notes: input.notes ?? null,
          linkedin_url: input.linkedin_url ?? null,
          linkedin_headline: input.linkedin_headline ?? null,
          linkedin_cover_url: input.linkedin_cover_url ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return data as TeamMember
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/** Update an existing team member */
export function useUpdateTeamMember() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Omit<TeamMember, 'id' | 'created_at'>>) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as TeamMember
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/** Delete a team member */
export function useDeleteTeamMember() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}
