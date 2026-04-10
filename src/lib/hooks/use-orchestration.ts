// ---------------------------------------------------------------------------
// TanStack Query hooks for Wave-Based Mission Orchestration
// ---------------------------------------------------------------------------
// Tables: dispatch_waves, agent_dispatches, dispatch_messages,
//         optimization_cycles, missions, venture_org_nodes, agents
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { buildOrchestratorPrompt, buildOptimizationCyclePrompt } from '@/lib/orchestration-prompts'
import type {
  Agent, Mission, MissionKPI, Venture, VentureOrgNode,
  VentureLink, OptimizationCycle,
} from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const orchestrationKeys = {
  waves: (missionId: string) => ['orchestration', 'waves', missionId] as const,
  waveDispatches: (waveId: string) => ['orchestration', 'wave-dispatches', waveId] as const,
  optimizationCycles: (missionId: string) => ['orchestration', 'opt-cycles', missionId] as const,
}

// ---------------------------------------------------------------------------
// Extended types
// ---------------------------------------------------------------------------

export interface DispatchWithAgent {
  id: string
  wave_id: string
  agent_id: string
  task_id: string | null
  status: string
  result: Record<string, unknown> | null
  advisor_calls: number
  model_tier: string
  created_at: string
  completed_at: string | null
  agent: Pick<Agent, 'id' | 'name' | 'slug' | 'status' | 'avatar_emoji' | 'role'>
}

export interface WaveWithDispatches {
  id: string
  mission_id: string
  wave_number: number
  status: string
  started_at: string | null
  completed_at: string | null
  created_at: string
  dispatches: DispatchWithAgent[]
}

// ---------------------------------------------------------------------------
// useWaves — fetch dispatch_waves with nested agent_dispatches
// ---------------------------------------------------------------------------

export function useWaves(missionId: string | null) {
  return useQuery<WaveWithDispatches[]>({
    queryKey: missionId ? orchestrationKeys.waves(missionId) : ['orchestration', 'waves', 'none'],
    enabled: !!missionId,
    refetchInterval: 10000,
    queryFn: async () => {
      if (!missionId) return []

      const { data: waves, error: wErr } = await supabase
        .from('dispatch_waves')
        .select('*')
        .eq('mission_id', missionId)
        .order('wave_number')

      if (wErr) throw wErr
      if (!waves || waves.length === 0) return []

      const waveIds = waves.map((w) => w.id)

      const { data: dispatches, error: dErr } = await supabase
        .from('agent_dispatches')
        .select('*, agent:agents(id, name, slug, status, avatar_emoji, role)')
        .in('wave_id', waveIds)
        .order('created_at')

      if (dErr) throw dErr

      // Group dispatches by wave_id
      const dispatchMap = new Map<string, DispatchWithAgent[]>()
      for (const d of dispatches ?? []) {
        const list = dispatchMap.get(d.wave_id) ?? []
        list.push(d as DispatchWithAgent)
        dispatchMap.set(d.wave_id, list)
      }

      return waves.map((w) => ({
        ...w,
        dispatches: dispatchMap.get(w.id) ?? [],
      })) as WaveWithDispatches[]
    },
  })
}

// ---------------------------------------------------------------------------
// useStartMissionOrchestration — THE KEY HOOK
// ---------------------------------------------------------------------------
// 1. Fetch mission with KPIs
// 2. Fetch venture
// 3. Fetch orchestrator org node + agent
// 4. Fetch team members (all agent org nodes for this venture)
// 5. Fetch venture links (for github_url, live_url)
// 6. Create Wave 0 (wave_number: 0, status: 'running')
// 7. Build orchestrator prompt (call buildOrchestratorPrompt)
// 8. Create agent_dispatch for the orchestrator
// 9. Create dispatch_message with the prompt
// Returns the dispatch ID
// ---------------------------------------------------------------------------

export function useStartMissionOrchestration() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { missionId: string; ventureId: string }) => {
      const { missionId, ventureId } = input

      // 1. Fetch mission with KPIs
      const { data: mission, error: mErr } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single()

      if (mErr) throw mErr

      const { data: kpis, error: kErr } = await supabase
        .from('mission_kpis')
        .select('*')
        .eq('mission_id', missionId)
        .order('sort_order')

      if (kErr) throw kErr

      // 2. Fetch venture
      const { data: venture, error: vErr } = await supabase
        .from('ventures')
        .select('*')
        .eq('id', ventureId)
        .single()

      if (vErr) throw vErr

      // 3. Fetch orchestrator org node + agent
      let orchestratorAgent: Agent | null = null
      let orchestratorNodeId: string | null = null

      if (mission.orchestrator_node_id) {
        const { data: orchNode } = await supabase
          .from('venture_org_nodes')
          .select('*, agent:agents(*)')
          .eq('id', mission.orchestrator_node_id)
          .single()

        if (orchNode?.agent) {
          orchestratorAgent = (orchNode as any).agent as Agent
          orchestratorNodeId = orchNode.id
        }
      }

      // Fallback: find orchestrator by looking for VP Engineering or team lead
      if (!orchestratorAgent) {
        const { data: orchNodes } = await supabase
          .from('venture_org_nodes')
          .select('*, agent:agents(*)')
          .eq('venture_id', ventureId)
          .eq('entity_type', 'agent')
          .order('sort_order')

        const vpEng = orchNodes?.find(
          (n) =>
            (n as any).agent?.slug === 'vp-eng' ||
            n.role_override?.toLowerCase().includes('lead') ||
            n.role_override?.toLowerCase().includes('orchestrator')
        )

        if (vpEng) {
          orchestratorAgent = (vpEng as any).agent as Agent
          orchestratorNodeId = vpEng.id
        }
      }

      if (!orchestratorAgent) {
        throw new Error('No orchestrator agent found for this venture. Add a team first.')
      }

      // 4. Fetch team members (all agent org nodes)
      const { data: teamNodes, error: tErr } = await supabase
        .from('venture_org_nodes')
        .select('*, agent:agents(*)')
        .eq('venture_id', ventureId)
        .eq('entity_type', 'agent')
        .order('sort_order')

      if (tErr) throw tErr

      // 5. Fetch venture links
      const { data: links } = await supabase
        .from('venture_links')
        .select('*')
        .eq('venture_id', ventureId)

      // 6. Create Wave 0
      const { data: wave, error: wErr } = await supabase
        .from('dispatch_waves')
        .insert({
          mission_id: missionId,
          wave_number: 0,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (wErr) throw wErr

      // 7. Build orchestrator prompt
      const teamRoster = (teamNodes ?? [])
        .filter((n) => (n as any).agent)
        .map((n) => {
          const agent = (n as any).agent as Agent
          return {
            name: n.name_override ?? agent.name,
            role: n.role_override ?? agent.role ?? '',
            platform: n.platform_override ?? agent.platform ?? '',
            model: n.model_override ?? agent.model ?? '',
            slug: agent.slug ?? '',
            skills: n.skills ?? [],
          }
        })

      const githubUrl = links?.find(
        (l) => l.label?.toLowerCase().includes('github') || l.url?.includes('github.com')
      )?.url ?? null

      const liveUrl = links?.find(
        (l) => l.label?.toLowerCase().includes('live') || l.label?.toLowerCase().includes('site')
      )?.url ?? null

      const prompt = buildOrchestratorPrompt({
        mission: mission as Mission,
        kpis: (kpis ?? []) as MissionKPI[],
        venture: venture as Venture,
        teamRoster,
        githubUrl,
        liveUrl,
      })

      // 8. Create agent_dispatch for the orchestrator
      const { data: dispatch, error: dErr } = await supabase
        .from('agent_dispatches')
        .insert({
          wave_id: wave.id,
          agent_id: orchestratorAgent.id,
          task_id: null,
          status: 'pending',
          model_tier: 'executor',
        })
        .select()
        .single()

      if (dErr) throw dErr

      // 9. Create dispatch_message with the prompt
      const { error: msgErr } = await supabase
        .from('dispatch_messages')
        .insert({
          dispatch_id: dispatch.id,
          role: 'user',
          content: prompt,
        })

      if (msgErr) throw msgErr

      // Update mission orchestrator_node_id if not set
      if (!mission.orchestrator_node_id && orchestratorNodeId) {
        await supabase
          .from('missions')
          .update({ orchestrator_node_id: orchestratorNodeId })
          .eq('id', missionId)
      }

      return dispatch.id as string
    },
    onSuccess: (_dispatchId, variables) => {
      qc.invalidateQueries({ queryKey: orchestrationKeys.waves(variables.missionId) })
      qc.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

// ---------------------------------------------------------------------------
// useDispatchWave — dispatch a wave of tasks to agents
// ---------------------------------------------------------------------------

export function useDispatchWave() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      missionId: string
      ventureId: string
      waveNumber: number
      tasks: { agentSlug: string; title: string; prompt: string }[]
      projectDir?: string | null
    }) => {
      const { missionId, ventureId, waveNumber, tasks, projectDir } = input

      // Create wave record
      const { data: wave, error: wErr } = await supabase
        .from('dispatch_waves')
        .insert({
          mission_id: missionId,
          wave_number: waveNumber,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (wErr) throw wErr

      // Fetch all agents for this venture to match by slug
      const { data: agentNodes } = await supabase
        .from('venture_org_nodes')
        .select('*, agent:agents(*)')
        .eq('venture_id', ventureId)
        .eq('entity_type', 'agent')

      const agents = (agentNodes ?? [])
        .filter((n) => (n as any).agent)
        .map((n) => (n as any).agent as Agent)

      const dispatchIds: string[] = []

      for (const task of tasks) {
        // Fuzzy match agent by slug
        const agent = agents.find(
          (a) =>
            a.slug === task.agentSlug ||
            a.slug?.includes(task.agentSlug) ||
            task.agentSlug.includes(a.slug ?? '') ||
            a.name.toLowerCase().includes(task.agentSlug.toLowerCase())
        )

        if (!agent) {
          console.warn(`Agent not found for slug: ${task.agentSlug}`)
          continue
        }

        // Create task record in the tasks table
        const { data: taskRecord, error: tErr } = await supabase
          .from('tasks')
          .insert({
            venture_id: ventureId,
            mission_id: missionId,
            assigned_to: agent.id,
            title: task.title,
            task_key: `W${waveNumber}-${task.agentSlug}`,
            status: 'in_progress',
            priority: 2,
          })
          .select('id')
          .single()

        if (tErr) throw tErr

        // Create agent_dispatch
        const { data: dispatch, error: dErr } = await supabase
          .from('agent_dispatches')
          .insert({
            wave_id: wave.id,
            agent_id: agent.id,
            task_id: taskRecord.id,
            status: 'pending',
            model_tier: 'executor',
          })
          .select()
          .single()

        if (dErr) throw dErr

        // Create dispatch_message with the task prompt
        const { error: msgErr } = await supabase
          .from('dispatch_messages')
          .insert({
            dispatch_id: dispatch.id,
            role: 'user',
            content: task.prompt,
          })

        if (msgErr) throw msgErr

        dispatchIds.push(dispatch.id)
      }

      return dispatchIds
    },
    onSuccess: (_ids, variables) => {
      qc.invalidateQueries({ queryKey: orchestrationKeys.waves(variables.missionId) })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ---------------------------------------------------------------------------
// useOptimizationCycles — fetch optimization_cycles ordered by cycle_number
// ---------------------------------------------------------------------------

export function useOptimizationCycles(missionId: string | null) {
  return useQuery<OptimizationCycle[]>({
    queryKey: missionId ? orchestrationKeys.optimizationCycles(missionId) : ['orchestration', 'opt-cycles', 'none'],
    enabled: !!missionId,
    refetchInterval: 15000,
    queryFn: async () => {
      if (!missionId) return []

      const { data, error } = await supabase
        .from('optimization_cycles')
        .select('*')
        .eq('mission_id', missionId)
        .order('cycle_number')

      if (error) throw error
      return (data ?? []) as OptimizationCycle[]
    },
  })
}

// ---------------------------------------------------------------------------
// useStartOptimizationCycle — start a new optimization cycle
// ---------------------------------------------------------------------------

export function useStartOptimizationCycle() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { missionId: string; ventureId: string }) => {
      const { missionId, ventureId } = input

      // Get the next cycle number
      const { data: existing } = await supabase
        .from('optimization_cycles')
        .select('cycle_number')
        .eq('mission_id', missionId)
        .order('cycle_number', { ascending: false })
        .limit(1)

      const nextCycle = (existing?.[0]?.cycle_number ?? 0) + 1

      // Fetch mission with KPIs
      const { data: mission, error: mErr } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single()

      if (mErr) throw mErr

      const { data: kpis } = await supabase
        .from('mission_kpis')
        .select('*')
        .eq('mission_id', missionId)

      // Snapshot current KPIs as kpi_before
      const kpiBefore: Record<string, number> = {}
      for (const k of kpis ?? []) {
        if (k.current_val != null) {
          kpiBefore[k.label] = k.current_val
        }
      }

      // Create optimization cycle
      const { data: cycle, error: cErr } = await supabase
        .from('optimization_cycles')
        .insert({
          mission_id: missionId,
          cycle_number: nextCycle,
          status: 'measuring',
          kpi_before: kpiBefore,
        })
        .select()
        .single()

      if (cErr) throw cErr

      // Fetch team and venture for the prompt
      const { data: venture } = await supabase
        .from('ventures')
        .select('*')
        .eq('id', ventureId)
        .single()

      const { data: teamNodes } = await supabase
        .from('venture_org_nodes')
        .select('*, agent:agents(*)')
        .eq('venture_id', ventureId)
        .eq('entity_type', 'agent')

      const { data: allCycles } = await supabase
        .from('optimization_cycles')
        .select('*')
        .eq('mission_id', missionId)
        .order('cycle_number')

      const teamRoster = (teamNodes ?? [])
        .filter((n) => (n as any).agent)
        .map((n) => {
          const agent = (n as any).agent as Agent
          return {
            name: n.name_override ?? agent.name,
            role: n.role_override ?? agent.role ?? '',
            slug: agent.slug ?? '',
          }
        })

      // Build optimization prompt
      const prompt = buildOptimizationCyclePrompt({
        mission: mission as Mission,
        kpis: (kpis ?? []) as MissionKPI[],
        venture: venture as Venture,
        cycleNumber: nextCycle,
        cycleHistory: (allCycles ?? []) as OptimizationCycle[],
        teamRoster,
      })

      // Create wave for this cycle
      const { data: wave, error: wErr } = await supabase
        .from('dispatch_waves')
        .insert({
          mission_id: missionId,
          wave_number: 1000 + nextCycle, // Offset cycle waves to avoid collision
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (wErr) throw wErr

      // Find orchestrator
      const orchNode = (teamNodes ?? []).find(
        (n) =>
          (n as any).agent?.slug === 'vp-eng' ||
          n.role_override?.toLowerCase().includes('lead')
      )

      const orchAgent = orchNode ? (orchNode as any).agent as Agent : null
      if (!orchAgent) throw new Error('No orchestrator found for optimization cycle')

      // Dispatch to orchestrator
      const { data: dispatch, error: dErr } = await supabase
        .from('agent_dispatches')
        .insert({
          wave_id: wave.id,
          agent_id: orchAgent.id,
          task_id: null,
          status: 'pending',
          model_tier: 'executor',
        })
        .select()
        .single()

      if (dErr) throw dErr

      const { error: msgErr } = await supabase
        .from('dispatch_messages')
        .insert({
          dispatch_id: dispatch.id,
          role: 'user',
          content: prompt,
        })

      if (msgErr) throw msgErr

      return { cycleId: cycle.id, dispatchId: dispatch.id }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: orchestrationKeys.optimizationCycles(variables.missionId) })
      qc.invalidateQueries({ queryKey: orchestrationKeys.waves(variables.missionId) })
    },
  })
}

// ---------------------------------------------------------------------------
// useToggleLoop — enable/disable loop_enabled on a mission
// ---------------------------------------------------------------------------

export function useToggleLoop() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { missionId: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('missions')
        .update({
          loop_enabled: input.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.missionId)
        .select()
        .single()

      if (error) throw error
      return data as Mission
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['missions'] })
      qc.invalidateQueries({ queryKey: ['autopilot'] })
      qc.invalidateQueries({ queryKey: orchestrationKeys.optimizationCycles(variables.missionId) })
    },
  })
}

// ---------------------------------------------------------------------------
// usePauseOptimizationLoop — convenience wrapper (used by AutopilotPanel)
// ---------------------------------------------------------------------------

export function usePauseOptimizationLoop() {
  const toggle = useToggleLoop()

  return useMutation({
    mutationFn: async (missionId: string) => {
      return toggle.mutateAsync({ missionId, enabled: false })
    },
  })
}
