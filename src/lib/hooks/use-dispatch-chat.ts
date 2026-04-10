// ---------------------------------------------------------------------------
// TanStack Query hooks for Dispatch Chat — messages within a dispatch thread
// ---------------------------------------------------------------------------

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/hooks/use-auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DispatchMessage {
  id: string
  dispatch_id: string
  role: 'user' | 'agent' | 'system'
  content: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const dispatchChatKeys = {
  messages: (dispatchId: string) => ['dispatch-chat', dispatchId] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all messages for a dispatch, ordered chronologically */
export function useDispatchMessages(dispatchId: string | null) {
  const qc = useQueryClient()

  const query = useQuery<DispatchMessage[]>({
    queryKey: dispatchId ? dispatchChatKeys.messages(dispatchId) : ['dispatch-chat', 'none'],
    enabled: !!dispatchId,
    queryFn: async () => {
      if (!dispatchId) return []
      const { data, error } = await supabase
        .from('dispatch_messages')
        .select('*')
        .eq('dispatch_id', dispatchId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data ?? []) as DispatchMessage[]
    },
  })

  // Realtime subscription for new messages
  useEffect(() => {
    if (!dispatchId) return

    const channel = supabase
      .channel(`dispatch-chat:${dispatchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispatch_messages',
          filter: `dispatch_id=eq.${dispatchId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: dispatchChatKeys.messages(dispatchId) })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dispatchId, qc])

  return query
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Send a user reply to a dispatch thread */
export function useSendReply() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: { dispatch_id: string; content: string }) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('dispatch_messages')
        .insert({
          user_id: userId,
          dispatch_id: input.dispatch_id,
          role: 'user',
          content: input.content,
        })
        .select()
        .single()

      if (error) throw error
      return data as DispatchMessage
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: dispatchChatKeys.messages(variables.dispatch_id) })
    },
  })
}
