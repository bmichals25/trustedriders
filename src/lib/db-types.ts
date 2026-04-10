/**
 * Extended database types used by dispatch-related hooks.
 *
 * These mirror the Supabase row types with joined fields so that
 * components receive pre-resolved agent metadata without extra queries.
 */

/* ── Agent dispatch (row + joined agent fields) ────────────────── */

export interface DbAgentDispatch {
  id: string
  wave_id: string
  agent_id: string
  task_id: string | null
  mission_id: string | null
  venture_id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  prompt: string
  result: string | null
  error: string | null
  token_count: number | null
  duration_ms: number | null
  advisor_calls: number
  model_tier: string
  started_at: string | null
  completed_at: string | null
  created_at: string
  // Joined from agents table
  agent_name: string
  agent_slug: string | null
  agent_platform: string | null
  agent_model: string
}

/* ── Dispatch message ──────────────────────────────────────────── */

export interface DbDispatchMessage {
  id: string
  dispatch_id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_name: string | null
  tool_args: Record<string, unknown> | null
  token_count: number | null
  created_at: string
}

/* ── Dispatch wave (container with nested dispatches) ──────────── */

export interface DbDispatchWave {
  id: string
  mission_id: string
  venture_id: string
  label: string | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
  dispatches: DbAgentDispatch[]
}
