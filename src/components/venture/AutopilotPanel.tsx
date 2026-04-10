import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Calendar, Clock, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Circle, Pause, Play, Zap, Brain,
} from 'lucide-react'
import { cn, cronToHuman, timeAgo } from '@/lib/utils'
import {
  useSystemHealth, getEffectiveStatus,
  useActiveOptimizationLoops, useSchedules,
  useAutopilotEvents, useToggleSchedule,
  type ActiveLoop,
} from '@/lib/hooks/use-autopilot'
import { usePauseOptimizationLoop } from '@/lib/hooks/use-orchestration'

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const statusColor: Record<string, string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  starting: 'bg-zinc-500',
}

const severityConfig: Record<string, { icon: typeof Circle; color: string }> = {
  info:    { icon: Circle,        color: 'text-zinc-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  error:   { icon: XCircle,       color: 'text-red-500' },
  success: { icon: CheckCircle2,  color: 'text-green-500' },
}

type EventFilter = 'all' | 'cycles' | 'schedules' | 'advisor' | 'errors'

// ---------------------------------------------------------------------------
// 1. SystemStatusBar
// ---------------------------------------------------------------------------

function SystemStatusBar() {
  const { data: components = [] } = useSystemHealth()

  const sessionCount = components.reduce(
    (sum, c) => sum + (c.session_count ?? 0), 0
  )
  const activeDispatches = components.reduce(
    (sum, c) => sum + (c.active_dispatches ?? 0), 0
  )

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          {components.map((c) => {
            const status = getEffectiveStatus(c)
            return (
              <div key={c.component} className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {status === 'healthy' && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40" />
                  )}
                  <span className={cn('relative inline-flex h-2 w-2 rounded-full', statusColor[status] ?? 'bg-zinc-600')} />
                </span>
                <span className="text-xs font-medium text-zinc-300">{c.component}</span>
                <span className="text-[10px] text-zinc-600">{timeAgo(c.last_heartbeat)}</span>
              </div>
            )
          })}
          {components.length === 0 && (
            <span className="text-xs text-zinc-600">No components reporting</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {sessionCount} session{sessionCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {activeDispatches} active
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. Sparkline (inline SVG)
// ---------------------------------------------------------------------------

function Sparkline({ data, color }: { data: { value: number; kept: boolean }[]; color: string }) {
  if (data.length === 0) return null

  const w = 80
  const h = 24
  const pad = 3
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const minVal = Math.min(...data.map(d => d.value), 0)
  const range = maxVal - minVal || 1

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2)
    const y = pad + (h - pad * 2) - ((d.value - minVal) / range) * (h - pad * 2)
    return { x, y, kept: d.kept }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
        points={polyline}
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2.5"
          fill={p.kept ? '#34d399' : '#ef4444'}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 2. LoopCard
// ---------------------------------------------------------------------------

function LoopCard({ loop, index }: { loop: ActiveLoop; index: number }) {
  const pauseLoop = usePauseOptimizationLoop()

  const primaryKpi = loop.kpis[0]
  const currentVal = primaryKpi?.current_val ?? 0
  const targetVal = loop.goal_value ?? primaryKpi?.target_val ?? 1
  const progress = Math.min(100, (currentVal / (targetVal || 1)) * 100)

  const isRunning = loop.cycle_status === 'running' || loop.cycle_status === 'evaluating'
  const isCompleted = loop.cycle_status === 'completed' && !loop.loop_enabled
  const isPaused = !loop.loop_enabled

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 flex flex-col gap-3"
      style={{ borderTopColor: loop.venture_color, borderTopWidth: 2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-100 truncate">{loop.mission_name}</h3>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: loop.venture_color + '20',
              color: loop.venture_color,
            }}
          >
            {loop.venture_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Status indicator */}
          {isRunning ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          ) : isCompleted ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : isPaused ? (
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
          )}
        </div>
      </div>

      {/* Cycle count */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <RefreshCw className="h-3 w-3" />
        <span>Cycle {loop.current_cycle}</span>
      </div>

      {/* Goal progress */}
      {loop.goal_metric && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">{loop.goal_metric}</span>
            <span className="font-mono text-zinc-400">
              {currentVal} <span className="text-zinc-600">/</span>{' '}
              <span style={{ color: loop.venture_color }}>{targetVal}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: loop.venture_color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] text-zinc-600">{Math.round(progress)}%</span>
        </div>
      )}

      {/* Sparkline */}
      {loop.recent_values.length > 1 && (
        <Sparkline data={loop.recent_values} color={loop.venture_color} />
      )}

      {/* Schedule badge */}
      {loop.schedule ? (
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Calendar className="h-3 w-3" />
          <span>{cronToHuman(loop.schedule.cron_expression)}</span>
          {loop.schedule.next_run_at && (
            <>
              <span className="text-zinc-700">|</span>
              <span>{timeAgo(loop.schedule.next_run_at)}</span>
            </>
          )}
        </div>
      ) : (
        <button className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors text-left">
          + Add schedule
        </button>
      )}

      {/* Pause/Resume toggle */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/40">
        <button
          onClick={() => pauseLoop.mutate({ missionId: loop.mission_id, enabled: !loop.loop_enabled })}
          disabled={pauseLoop.isPending}
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all',
            loop.loop_enabled
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
          )}
        >
          {loop.loop_enabled ? <><Pause className="h-2.5 w-2.5" /> Running</> : <><Play className="h-2.5 w-2.5" /> Paused</>}
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 2. ActiveLoopsGrid
// ---------------------------------------------------------------------------

function ActiveLoopsGrid({ ventureId }: { ventureId?: string }) {
  const { data: loops = [], isLoading } = useActiveOptimizationLoops(ventureId)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
        <RefreshCw className="h-5 w-5 text-zinc-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-zinc-600">Loading active loops...</p>
      </div>
    )
  }

  if (loops.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
        <RefreshCw className="h-6 w-6 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">No active optimization loops</p>
        <p className="text-xs text-zinc-600 mt-1">
          Enable loop mode on a mission to start autonomous optimization.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loops.map((loop, i) => (
        <LoopCard key={loop.mission_id} loop={loop} index={i} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. ScheduleTimeline
// ---------------------------------------------------------------------------

function ScheduleTimeline({ ventureId }: { ventureId: string | null }) {
  const { data: schedules = [] } = useSchedules(ventureId)
  const toggleSchedule = useToggleSchedule()

  if (!ventureId) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Upcoming Schedules
          </span>
        </div>
        <p className="text-xs text-zinc-600 text-center py-4">
          Select a venture to see schedules
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Upcoming Schedules
        </span>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Clock className="h-5 w-5 text-zinc-700" />
          <p className="text-xs text-zinc-600">No schedules configured</p>
        </div>
      ) : (
        <div className="space-y-1">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-zinc-900/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-zinc-300 shrink-0">
                  {s.next_run_at ? timeAgo(s.next_run_at) : '--'}
                </span>
                <span className="text-xs text-zinc-400 truncate">
                  {s.mission_id.slice(0, 8)}
                </span>
                <span className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  s.action_type === 'run_cycle'
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : s.action_type === 'run_orchestration'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-zinc-800 text-zinc-500'
                )}>
                  {s.action_type.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => toggleSchedule.mutate({ id: s.id, enabled: !s.enabled })}
                disabled={toggleSchedule.isPending}
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors shrink-0',
                  s.enabled ? 'bg-green-500/30' : 'bg-zinc-800'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full transition-all',
                    s.enabled
                      ? 'left-[18px] bg-green-400'
                      : 'left-0.5 bg-zinc-600'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. ActivityLog
// ---------------------------------------------------------------------------

function ActivityLog({ ventureId }: { ventureId?: string }) {
  const { data: events = [] } = useAutopilotEvents(ventureId, 50)
  const [filter, setFilter] = useState<EventFilter>('all')

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true
    if (filter === 'cycles') return e.event_type === 'cycle_completed'
    if (filter === 'schedules') return e.event_type === 'schedule_fired'
    if (filter === 'advisor') return e.event_type === 'advisor_called'
    if (filter === 'errors') return e.severity === 'error' || e.severity === 'warning'
    return true
  })

  const advisorCount = events.filter(e => e.event_type === 'advisor_called').length

  const filterTabs: { key: EventFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'cycles', label: 'Cycles' },
    { key: 'schedules', label: 'Schedules' },
    { key: 'advisor', label: `Advisor${advisorCount > 0 ? ` (${advisorCount})` : ''}` },
    { key: 'errors', label: 'Errors' },
  ]

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Activity
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                filter === tab.key
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-400'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="max-h-80 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 py-8 text-center"
            >
              <Activity className="h-5 w-5 text-zinc-700" />
              <p className="text-xs text-zinc-600">No events yet</p>
            </motion.div>
          ) : (
            filteredEvents.map((event) => {
              const config = severityConfig[event.severity] ?? severityConfig.info
              const isAdvisor = event.event_type === 'advisor_called'
              const Icon = isAdvisor ? Brain : config.icon
              const iconColor = isAdvisor ? 'text-purple-400' : config.color
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-zinc-900/40 transition-colors"
                >
                  <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', iconColor)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-300 truncate">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0 mt-0.5">
                    {timeAgo(event.created_at)}
                  </span>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main: AutopilotPanel
// ---------------------------------------------------------------------------

export default function AutopilotPanel({ ventureId }: { ventureId?: string }) {
  return (
    <div className="space-y-6">
      {/* 1. System Status */}
      <SystemStatusBar />

      {/* 2. Active Loops */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Active Optimization Loops
          </h2>
        </div>
        <ActiveLoopsGrid ventureId={ventureId} />
      </section>

      {/* 3. Schedule Timeline */}
      <ScheduleTimeline ventureId={ventureId ?? null} />

      {/* 4. Activity Log */}
      <ActivityLog ventureId={ventureId} />
    </div>
  )
}
