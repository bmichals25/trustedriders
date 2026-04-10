// ---------------------------------------------------------------------------
// TanStack Query hooks for Agent Team Presets
// ---------------------------------------------------------------------------
// Tables: agent_team_presets, agent_team_preset_members, agent_team_memory,
//         venture_org_nodes, agent_ventures
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { AgentTeamPreset, AgentTeamPresetMember, VentureOrgNode, Agent } from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const presetKeys = {
  all: () => ['team-presets'] as const,
  detail: (id: string) => ['team-presets', id] as const,
}

// ---------------------------------------------------------------------------
// Extended types for query results
// ---------------------------------------------------------------------------

export interface PresetWithCount extends AgentTeamPreset {
  member_count: number
}

export interface PresetWithMembers extends AgentTeamPreset {
  members: (AgentTeamPresetMember & { agent: Agent })[]
}

// ---------------------------------------------------------------------------
// useTeamPresets — fetch all presets with member count
// ---------------------------------------------------------------------------

export function useTeamPresets() {
  return useQuery<PresetWithCount[]>({
    queryKey: presetKeys.all(),
    queryFn: async () => {
      const { data: presets, error } = await supabase
        .from('agent_team_presets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!presets || presets.length === 0) return []

      // Fetch member counts for all presets
      const { data: members, error: mErr } = await supabase
        .from('agent_team_preset_members')
        .select('preset_id')

      if (mErr) throw mErr

      const countMap = new Map<string, number>()
      for (const m of members ?? []) {
        countMap.set(m.preset_id, (countMap.get(m.preset_id) ?? 0) + 1)
      }

      return presets.map((p) => ({
        ...p,
        member_count: countMap.get(p.id) ?? 0,
      })) as PresetWithCount[]
    },
  })
}

// ---------------------------------------------------------------------------
// useTeamPreset — single preset with full members + agent details
// ---------------------------------------------------------------------------

export function useTeamPreset(id: string | null) {
  return useQuery<PresetWithMembers | null>({
    queryKey: id ? presetKeys.detail(id) : ['team-presets', 'none'],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null

      const { data: preset, error } = await supabase
        .from('agent_team_presets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const { data: members, error: mErr } = await supabase
        .from('agent_team_preset_members')
        .select('*, agent:agents(*)')
        .eq('preset_id', id)
        .order('sort_order')

      if (mErr) throw mErr

      return {
        ...preset,
        members: (members ?? []) as (AgentTeamPresetMember & { agent: Agent })[],
      } as PresetWithMembers
    },
  })
}

// ---------------------------------------------------------------------------
// useCreateTeamPreset — insert preset + batch-insert members
// ---------------------------------------------------------------------------

export function useCreateTeamPreset() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      name: string
      description?: string | null
      icon?: string
      color?: string
      orchestrator_agent_id?: string | null
      members: { agent_id: string; role_override?: string | null; sort_order?: number }[]
    }) => {
      const { data: preset, error } = await supabase
        .from('agent_team_presets')
        .insert({
          name: input.name,
          description: input.description ?? null,
          icon: input.icon ?? '👥',
          color: input.color ?? '#818CF8',
          orchestrator_agent_id: input.orchestrator_agent_id ?? null,
        })
        .select()
        .single()

      if (error) throw error

      // Batch-insert members
      if (input.members.length > 0) {
        const rows = input.members.map((m, i) => ({
          preset_id: preset.id,
          agent_id: m.agent_id,
          role_override: m.role_override ?? null,
          sort_order: m.sort_order ?? i,
        }))

        const { error: mErr } = await supabase
          .from('agent_team_preset_members')
          .insert(rows)

        if (mErr) throw mErr
      }

      return preset as AgentTeamPreset
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: presetKeys.all() })
    },
  })
}

// ---------------------------------------------------------------------------
// useDeleteTeamPreset
// ---------------------------------------------------------------------------

export function useDeleteTeamPreset() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agent_team_presets')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: presetKeys.all() })
    },
  })
}

// ---------------------------------------------------------------------------
// useAddPresetToVenture — KEY HOOK
// ---------------------------------------------------------------------------
// 1. Fetch preset with members
// 2. Auto-create root node if missing for venture
// 3. Auto-create founder (human) node if missing
// 4. Insert orchestrator agent as team lead node
// 5. Insert all preset members as agent nodes under the orchestrator
// 6. Create agent_ventures junction rows
// ---------------------------------------------------------------------------

export function useAddPresetToVenture() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { presetId: string; ventureId: string }) => {
      const { presetId, ventureId } = input

      // 1. Fetch preset with members
      const { data: preset, error: pErr } = await supabase
        .from('agent_team_presets')
        .select('*')
        .eq('id', presetId)
        .single()

      if (pErr) throw pErr

      const { data: presetMembers, error: mErr } = await supabase
        .from('agent_team_preset_members')
        .select('*, agent:agents(*)')
        .eq('preset_id', presetId)
        .order('sort_order')

      if (mErr) throw mErr

      // 2. Auto-create root node if missing
      const { data: existingRoot } = await supabase
        .from('venture_org_nodes')
        .select('id')
        .eq('venture_id', ventureId)
        .eq('entity_type', 'root')
        .maybeSingle()

      let rootNodeId: string

      if (existingRoot) {
        rootNodeId = existingRoot.id
      } else {
        const { data: rootNode, error: rErr } = await supabase
          .from('venture_org_nodes')
          .insert({
            venture_id: ventureId,
            parent_node_id: null,
            entity_type: 'root',
            name_override: 'Organization',
            sort_order: 0,
          })
          .select('id')
          .single()

        if (rErr) throw rErr
        rootNodeId = rootNode.id
      }

      // 3. Auto-create founder (human) node if missing
      const userId = await getCurrentUserId()

      const { data: existingHuman } = await supabase
        .from('venture_org_nodes')
        .select('id')
        .eq('venture_id', ventureId)
        .eq('entity_type', 'human')
        .maybeSingle()

      if (!existingHuman) {
        // Find the team_member for the current user
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('id, name')
          .eq('id', userId)
          .maybeSingle()

        await supabase
          .from('venture_org_nodes')
          .insert({
            venture_id: ventureId,
            parent_node_id: rootNodeId,
            entity_type: 'human',
            member_id: teamMember?.id ?? userId,
            name_override: teamMember?.name ?? 'Founder',
            role_override: 'Founder',
            sort_order: 0,
          })
      }

      // 4. Insert orchestrator agent as team lead node
      let orchestratorNodeId: string | null = null

      if (preset.orchestrator_agent_id) {
        const { data: orchNode, error: oErr } = await supabase
          .from('venture_org_nodes')
          .insert({
            venture_id: ventureId,
            parent_node_id: rootNodeId,
            entity_type: 'agent',
            agent_id: preset.orchestrator_agent_id,
            role_override: 'Team Lead',
            sort_order: 1,
            team_preset_id: presetId,
          })
          .select('id')
          .single()

        if (oErr) throw oErr
        orchestratorNodeId = orchNode.id

        // Create agent_ventures junction for orchestrator
        await supabase
          .from('agent_ventures')
          .upsert({
            agent_id: preset.orchestrator_agent_id,
            venture_id: ventureId,
          }, { onConflict: 'agent_id,venture_id' })
      }

      // 5. Insert all preset members as agent nodes under the orchestrator
      const parentForMembers = orchestratorNodeId ?? rootNodeId

      const memberNodes = (presetMembers ?? []).map((m, i) => ({
        venture_id: ventureId,
        parent_node_id: parentForMembers,
        entity_type: 'agent' as const,
        agent_id: m.agent_id,
        role_override: m.role_override ?? (m as any).agent?.role ?? null,
        sort_order: i + 2,
        team_preset_id: presetId,
      }))

      if (memberNodes.length > 0) {
        const { error: nErr } = await supabase
          .from('venture_org_nodes')
          .insert(memberNodes)

        if (nErr) throw nErr
      }

      // 6. Create agent_ventures junction rows
      const agentIds = (presetMembers ?? []).map((m) => m.agent_id)
      if (agentIds.length > 0) {
        const junctionRows = agentIds.map((agentId) => ({
          agent_id: agentId,
          venture_id: ventureId,
        }))

        await supabase
          .from('agent_ventures')
          .upsert(junctionRows, { onConflict: 'agent_id,venture_id' })
      }

      return { rootNodeId, orchestratorNodeId }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['org-tree', variables.ventureId] })
      qc.invalidateQueries({ queryKey: ['ventures'] })
    },
  })
}

// ---------------------------------------------------------------------------
// useSaveVentureTeamAsPreset — save a venture's agent org nodes as a preset
// ---------------------------------------------------------------------------

export function useSaveVentureTeamAsPreset() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      ventureId: string
      name: string
      description?: string | null
      icon?: string
      color?: string
    }) => {
      // Fetch all agent org nodes for this venture
      const { data: nodes, error: nErr } = await supabase
        .from('venture_org_nodes')
        .select('*, agent:agents(*)')
        .eq('venture_id', input.ventureId)
        .eq('entity_type', 'agent')
        .order('sort_order')

      if (nErr) throw nErr
      if (!nodes || nodes.length === 0) throw new Error('No agent nodes found for this venture')

      // Identify the orchestrator — the agent node closest to root (lowest sort_order)
      // or the one with role_override containing "lead" or "orchestrator"
      const orchestratorNode = nodes.find(
        (n) =>
          n.role_override?.toLowerCase().includes('lead') ||
          n.role_override?.toLowerCase().includes('orchestrator')
      ) ?? nodes[0]

      const orchestratorAgentId = orchestratorNode?.agent_id ?? null

      // Create the preset
      const { data: preset, error: pErr } = await supabase
        .from('agent_team_presets')
        .insert({
          name: input.name,
          description: input.description ?? null,
          icon: input.icon ?? '👥',
          color: input.color ?? '#818CF8',
          orchestrator_agent_id: orchestratorAgentId,
        })
        .select()
        .single()

      if (pErr) throw pErr

      // Insert members (excluding the orchestrator since it's separate)
      const memberNodes = nodes.filter((n) => n.agent_id !== orchestratorAgentId)
      if (memberNodes.length > 0) {
        const rows = memberNodes.map((n, i) => ({
          preset_id: preset.id,
          agent_id: n.agent_id!,
          role_override: n.role_override,
          sort_order: i,
        }))

        const { error: mErr } = await supabase
          .from('agent_team_preset_members')
          .insert(rows)

        if (mErr) throw mErr
      }

      return preset as AgentTeamPreset
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: presetKeys.all() })
    },
  })
}
