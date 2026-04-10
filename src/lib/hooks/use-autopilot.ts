// ---------------------------------------------------------------------------
// TanStack Query hooks for the Autopilot system — scheduling, health, events
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  MissionSchedule, SystemHealth, AutopilotEvent,
  ScheduleActionType,
} from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const autopilotKeys = {
  health: () => ['autopilot', 'health'] as const,
  schedules: (ventureId: string) => ['autopilot', 'schedules', ventureId] as const,
  scheduleByMission: (missionId: string) => ['autopilot', 'schedule-mission', missionId] as const,
  events: (ventureId?: string) => ['autopilot', 'events', ventureId ?? 'all'] as const,
  activeLoops: (ventureId?: string) => ['autopilot', 'active-loops', ventureId ?? 'all'] as const,
}

// ---------------------------------------------------------------------------
// System Health
// ---------------------------------------------------------------------------

export function useSystemHealth() {
  return useQuery<SystemHealth[]>({
    queryKey: autopilotKeys.health(),
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .order('component')

      if (error) throw error
      return (data ?? []) as SystemHealth[]
    },
  })
}

/** Derive display status from heartbeat age (client-side) */
export function getEffectiveStatus(health: SystemHealth): SystemHealth['status'] {
  const age = Date.now() - new Date(health.last_heartbeat).getTime()
  if (age > 5 * 60 * 1000) return 'down'
  if (age > 90 * 1000) return 'degraded'
  return health.status
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

export function useSchedules(ventureId: string | null) {
  return useQuery<MissionSchedule[]>({
    queryKey: ventureId ? autopilotKeys.schedules(ventureId) : ['autopilot', 'schedules', 'none'],
    enabled: !!ventureId,
    refetchInterval: 30000,
    queryFn: async () => {
      if (!ventureId) return []
      const { data, error } = await supabase
        .from('mission_schedules')
        .select('*')
        .eq('venture_id', ventureId)
        .order('next_run_at', { ascending: true })

      if (error) throw error
      return (data ?? []) as MissionSchedule[]
    },
  })
}

export function useMissionSchedule(missionId: string | null) {
  return useQuery<MissionSchedule | null>({
    queryKey: missionId ? autopilotKeys.scheduleByMission(missionId) : ['autopilot', 'schedule-mission', 'none'],
    enabled: !!missionId,
    refetchInterval: 30000,
    queryFn: async () => {
      if (!missionId) return null
      const { data, error } = await supabase
        .from('mission_schedules')
        .select('*')
        .eq('mission_id', missionId)
        .maybeSingle()

      if (error) throw error
      return (data as MissionSchedule) ?? null
    },
  })
}

// ---------------------------------------------------------------------------
// Autopilot Events
// ---------------------------------------------------------------------------

export function useAutopilotEvents(ventureId?: string, limit = 50) {
  return useQuery<AutopilotEvent[]>({
    queryKey: autopilotKeys.events(ventureId),
    refetchInterval: 10000,
    queryFn: async () => {
      let query = supabase
        .from('autopilot_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (ventureId) {
        query = query.eq('venture_id', ventureId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as AutopilotEvent[]
    },
  })
}

// ---------------------------------------------------------------------------
// Active Optimization Loops
// ---------------------------------------------------------------------------

export interface ActiveLoop {
  mission_id: string
  mission_name: string
  venture_id: string
  venture_name: string
  venture_color: string
  goal_metric: string | null
  goal_value: number | null
  loop_enabled: boolean
  current_cycle: number
  cycle_status: string | null
  kpis: { label: string; current_val: number | null; target_val: number | null; unit: string }[]
  recent_values: { cycle: number; value: number; kept: boolean }[]
  schedule: MissionSchedule | null
}

export function useActiveOptimizationLoops(ventureId?: string) {
  return useQuery<ActiveLoop[]>({
    queryKey: autopilotKeys.activeLoops(ventureId),
    refetchInterval: 15000,
    queryFn: async () => {
      // Fetch loop-enabled missions
      let missionsQuery = supabase
        .from('missions')
        .select('id, name, venture_id, goal_metric, goal_value, loop_enabled, status')
        .eq('loop_enabled', true)

      if (ventureId) {
        missionsQuery = missionsQuery.eq('venture_id', ventureId)
      }

      const { data: missions, error: mErr } = await missionsQuery
      if (mErr) throw mErr
      if (!missions || missions.length === 0) return []

      const results: ActiveLoop[] = []

      for (const m of missions) {
        // Fetch venture
        const { data: venture } = await supabase
          .from('ventures')
          .select('name, primary_color')
          .eq('id', m.venture_id)
          .single()

        // Fetch KPIs
        const { data: kpis } = await supabase
          .from('mission_kpis')
          .select('label, current_val, target_val, unit')
          .eq('mission_id', m.id)

        // Fetch recent cycles (last 10)
        const { data: cycles } = await supabase
          .from('optimization_cycles')
          .select('cycle_number, status, kpi_after, kept')
          .eq('mission_id', m.id)
          .order('cycle_number', { ascending: false })
          .limit(10)

        const latestCycle = cycles?.[0]

        // Fetch schedule
        const { data: schedule } = await supabase
          .from('mission_schedules')
          .select('*')
          .eq('mission_id', m.id)
          .maybeSingle()

        results.push({
          mission_id: m.id,
          mission_name: m.name,
          venture_id: m.venture_id,
          venture_name: venture?.name ?? '',
          venture_color: venture?.primary_color ?? '#818CF8',
          goal_metric: m.goal_metric,
          goal_value: m.goal_value,
          loop_enabled: m.loop_enabled,
          current_cycle: latestCycle?.cycle_number ?? 0,
          cycle_status: latestCycle?.status ?? null,
          kpis: (kpis ?? []).map(k => ({
            label: k.label,
            current_val: k.current_val,
            target_val: k.target_val,
            unit: k.unit,
          })),
          recent_values: (cycles ?? []).reverse().map(c => ({
            cycle: c.cycle_number,
            value: c.kpi_after?.[m.goal_metric ?? ''] ?? 0,
            kept: c.kept ?? false,
          })),
          schedule: schedule as MissionSchedule | null,
        })
      }

      return results
    },
  })
}

// ---------------------------------------------------------------------------
// Schedule Mutations
// ---------------------------------------------------------------------------

export function useCreateSchedule() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      mission_id: string
      venture_id: string
      action_type: ScheduleActionType
      cron_expression: string
      timezone?: string
    }) => {
      const { data, error } = await supabase
        .from('mission_schedules')
        .insert({
          mission_id: input.mission_id,
          venture_id: input.venture_id,
          action_type: input.action_type,
          cron_expression: input.cron_expression,
          timezone: input.timezone ?? 'America/New_York',
          enabled: true,
          last_status: 'pending',
        })
        .select()
        .single()

      if (error) throw error
      return data as MissionSchedule
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: autopilotKeys.schedules(variables.venture_id) })
      qc.invalidateQueries({ queryKey: autopilotKeys.scheduleByMission(variables.mission_id) })
      qc.invalidateQueries({ queryKey: autopilotKeys.activeLoops() })
    },
  })
}

export function useToggleSchedule() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('mission_schedules')
        .update({ enabled: input.enabled, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error
      return data as MissionSchedule
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['autopilot'] })
    },
  })
}

export function useDeleteSchedule() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string }) => {
      const { error } = await supabase
        .from('mission_schedules')
        .delete()
        .eq('id', input.id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['autopilot'] })
    },
  })
}
