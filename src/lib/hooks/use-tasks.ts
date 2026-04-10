// ---------------------------------------------------------------------------
// TanStack Query hooks for Tasks — CRUD with auto-incrementing task_key
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'
import type { Task } from '@/types'

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const taskKeys = {
  all: ['tasks'] as const,
  byVenture: (ventureId: string) => ['tasks', 'venture', ventureId] as const,
  byMission: (missionId: string) => ['tasks', 'mission', missionId] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all tasks */
export function useTasksQuery() {
  return useQuery<Task[]>({
    queryKey: taskKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as Task[]
    },
  })
}

/** Fetch tasks for a specific venture */
export function useTasksByVenture(ventureId: string | null) {
  return useQuery<Task[]>({
    queryKey: ventureId ? taskKeys.byVenture(ventureId) : ['tasks', 'venture', 'none'],
    enabled: !!ventureId,
    queryFn: async () => {
      if (!ventureId) return []
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('venture_id', ventureId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as Task[]
    },
  })
}

/** Fetch tasks for a specific mission */
export function useTasksByMission(missionId: string | null) {
  return useQuery<Task[]>({
    queryKey: missionId ? taskKeys.byMission(missionId) : ['tasks', 'mission', 'none'],
    enabled: !!missionId,
    queryFn: async () => {
      if (!missionId) return []
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as Task[]
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a task with auto-incrementing task_key from the venture's task_key_seq */
export function useCreateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      venture_id: string
      title: string
      description?: string
      status?: Task['status']
      priority?: Task['priority']
      due_date?: string | null
      mission_id?: string | null
      assigned_to?: string | null
    }) => {
      const userId = await getCurrentUserId()

      // Read current sequence number
      const { data: venture, error: vErr } = await supabase
        .from('ventures')
        .select('task_key_seq')
        .eq('id', input.venture_id)
        .single()

      if (vErr) throw vErr

      const nextSeq = (venture.task_key_seq ?? 0) + 1

      // Increment sequence on venture
      const { error: seqErr } = await supabase
        .from('ventures')
        .update({ task_key_seq: nextSeq })
        .eq('id', input.venture_id)

      if (seqErr) throw seqErr

      // Create task with generated task_key
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          venture_id: input.venture_id,
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? 'todo',
          priority: input.priority ?? 0,
          due_date: input.due_date ?? null,
          mission_id: input.mission_id ?? null,
          assigned_to: input.assigned_to ?? null,
          task_key: `T-${nextSeq}`,
        })
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskKeys.byVenture(variables.venture_id) })
      if (variables.mission_id) {
        qc.invalidateQueries({ queryKey: taskKeys.byMission(variables.mission_id) })
      }
    },
  })
}

/** Partial update of a task */
export function useUpdateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'task_key'>>) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      // Invalidate all venture/mission sub-keys since we don't track which ones changed
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** Delete a task */
export function useDeleteTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
