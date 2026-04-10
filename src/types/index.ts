export type VentureStage = 'idea' | 'research' | 'building' | 'testing' | 'launched' | 'archived'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 0 | 1 | 2 | 3 | 4
export type AgentTier = 'leadership' | 'vp' | 'ic'
export type MissionType = 'product' | 'growth' | 'infrastructure' | 'research' | 'operations' | 'optimization'
export type MissionStatus = 'active' | 'completed' | 'paused'
export type OrgNodeType = 'human' | 'agent' | 'root'
export type MeasurementSource = 'plausible' | 'stripe' | 'manual'

export interface Venture {
  id: string
  name: string
  description: string | null
  stage: VentureStage
  primary_color: string
  secondary_color: string
  logo_url: string | null
  logo_emoji: string | null
  task_key_seq: number
  stripe_product_id?: string | null
  stripe_price_id?: string | null
  stripe_checkout_url?: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  notes: string | null
  linkedin_url: string | null
  linkedin_headline: string | null
  linkedin_cover_url: string | null
  linkedin_scraped_at: string | null
  created_at: string
}

export interface VentureMember { id: string; venture_id: string; member_id: string; role: string; joined_at: string }

export interface Task {
  id: string
  venture_id: string
  mission_id: string | null
  assigned_to: string | null
  task_key: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface VentureLink { id: string; venture_id: string; url: string; label: string; title: string | null; sort_order: number }

export interface Agent {
  id: string
  name: string
  slug: string | null
  role: string | null
  tier: AgentTier | null
  platform: string | null
  avatar_emoji: string
  system_prompt: string
  model: string
  mcp_servers: string[]
  status: string
  current_task_id: string | null
  created_at: string
  updated_at: string
}

export interface AgentHierarchyRow { id: string; agent_id: string; reports_to_id: string | null; sort_order: number }
export interface AgentConnector { id: string; agent_id: string; name: string; config: Record<string, unknown>; created_at: string }

export interface VentureOrgNode {
  id: string
  venture_id: string
  parent_node_id: string | null
  entity_type: OrgNodeType
  member_id: string | null
  agent_id: string | null
  name_override: string | null
  role_override: string | null
  initials_override: string | null
  sort_order: number
  platform_override: string | null
  model_override: string | null
  skills: string[]
  connectors: string[]
  agent_md: string | null
  bio: string | null
  linkedin_url: string | null
  website_url: string | null
  cover_url: string | null
  responsibilities: string[]
  team_preset_id: string | null
  created_at: string
}

export interface Mission {
  id: string
  venture_id: string
  name: string
  description: string | null
  type: MissionType | null
  status: MissionStatus
  owner_node_id: string | null
  orchestrator_node_id: string | null
  loop_enabled: boolean
  goal_metric: string | null
  goal_value: number | null
  measurement_source: MeasurementSource | null
  measurement_config: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface OptimizationCycle {
  id: string; mission_id: string; cycle_number: number
  status: 'pending' | 'measuring' | 'hypothesizing' | 'executing' | 'evaluating' | 'completed'
  hypothesis: string | null; change_description: string | null
  kpi_before: Record<string, number>; kpi_after: Record<string, number>
  improved: boolean | null; kept: boolean | null
  created_at: string; completed_at: string | null
}

export interface MissionKPI { id: string; mission_id: string; label: string; current_val: number | null; target_val: number | null; unit: string; sort_order: number }
export interface Message { id: string; venture_id: string; task_id: string | null; agent_id: string | null; sender_type: 'user' | 'agent'; content: string; created_at: string }

export interface AgentTeamPreset { id: string; name: string; description: string | null; icon: string; color: string; orchestrator_agent_id: string | null; created_at: string; updated_at: string }
export interface AgentTeamPresetMember { id: string; preset_id: string; agent_id: string; role_override: string | null; sort_order: number }
export interface AgentTeamMemory { id: string; preset_id: string; venture_id: string | null; agent_id: string | null; content: string; category: string; created_at: string }

export type VentureFileType = 'external_link' | 'uploaded'
export interface VentureFile { id: string; venture_id: string; label: string; file_type: VentureFileType; url: string; mime_type: string | null; file_size: number | null; sort_order: number; created_at: string }

export interface OrgTreeRow {
  id: string; venture_id: string; parent_node_id: string | null; entity_type: OrgNodeType
  member_id: string | null; agent_id: string | null; resolved_name: string | null; resolved_role: string | null
  initials_override: string | null; sort_order: number; skills: string[]; connectors: string[]
  agent_md: string | null; bio: string | null; linkedin_url: string | null; website_url: string | null
  responsibilities: string[]; resolved_platform: string | null; resolved_model: string | null
  agent_status: string | null; depth: number; path: string[]
}

export type ScheduleActionType = 'optimization_cycle' | 'orchestrate' | 'dispatch_wave'
export type ScheduleStatus = 'pending' | 'success' | 'failed' | 'running'
export interface MissionSchedule {
  id: string; mission_id: string; venture_id: string; action_type: ScheduleActionType
  cron_expression: string; timezone: string; enabled: boolean
  last_run_at: string | null; next_run_at: string | null; last_status: ScheduleStatus
  run_count: number; created_at: string; updated_at: string
}

export type HealthStatus = 'starting' | 'healthy' | 'degraded' | 'down'
export interface SystemHealth { id: string; component: string; status: HealthStatus; last_heartbeat: string; session_count: number; active_dispatches: number; error_log: string | null; metadata: Record<string, unknown>; created_at: string }

export type EventSeverity = 'info' | 'warning' | 'error' | 'success'
export interface AutopilotEvent { id: string; venture_id: string | null; mission_id: string | null; event_type: string; severity: EventSeverity; title: string; description: string | null; metadata: Record<string, unknown>; created_at: string }

export type UserRole = 'admin' | 'user'
export interface UserProfile { id: string; user_id: string; display_name: string | null; avatar_url: string | null; stripe_account_id: string | null; stripe_onboarded: boolean; stripe_charges_enabled: boolean; stripe_payouts_enabled: boolean; role: UserRole; created_at: string; updated_at: string }
export interface VentureEnvVar { id: string; venture_id: string; key: string; value: string; is_secret: boolean; created_at: string }
export interface VentureRevenue { id: string; venture_id: string; period_start: string; period_end: string; gross_revenue: number; platform_fee: number; net_revenue: number; payment_count: number; refund_count: number; currency: string; created_at: string }
export interface StripeEvent { id: string; event_id: string; event_type: string; venture_id: string | null; amount: number | null; currency: string | null; metadata: Record<string, unknown>; processed_at: string }
export interface PlatformSettings { key: string; value: unknown; updated_at: string }

export type KnowledgeNodeType = 'tactic' | 'metric' | 'pattern' | 'insight'
export type KnowledgeSourceType = 'extracted' | 'inferred' | 'ambiguous'
export type KnowledgeEdgeType = 'improves' | 'hurts' | 'related_to' | 'depends_on' | 'conflicts_with'
export interface KnowledgeNode { id: string; label: string; node_type: KnowledgeNodeType; description: string | null; source_type: KnowledgeSourceType; confidence: number; times_tested: number; times_kept: number; avg_impact: number | null; venture_types: string[]; metric_types: string[]; tags: string[]; created_at: string; updated_at: string }
export interface KnowledgeEdge { id: string; source_id: string; target_id: string; edge_type: KnowledgeEdgeType; weight: number; source_type: KnowledgeSourceType; confidence: number; evidence_count: number; description: string | null; created_at: string }
export interface KnowledgeProvenance { id: string; node_id: string; cycle_id: string; venture_id: string; mission_id: string; metric_before: number | null; metric_after: number | null; was_kept: boolean; created_at: string }
