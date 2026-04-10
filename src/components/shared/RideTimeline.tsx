import { CheckCircle2, Circle } from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'
import type { RideTimelineEvent, RideStatus } from '@/types/nemt'

const ALL_STEPS: { status: RideStatus | string; label: string }[] = [
  { status: 'scheduled',  label: 'Ride Scheduled' },
  { status: 'en-route',   label: 'Driver En Route' },
  { status: 'picked-up',  label: 'Passenger Picked Up' },
  { status: 'in-transit', label: 'In Transit to Destination' },
  { status: 'arrived',    label: 'Arrived at Destination' },
  { status: 'completed',  label: 'Ride Completed' },
]

interface RideTimelineProps {
  events: RideTimelineEvent[]
  currentStatus: RideStatus | string
}

export default function RideTimeline({ events, currentStatus }: RideTimelineProps) {
  const completedStatuses = new Set(events.map((e) => e.status))
  const eventByStatus = Object.fromEntries(events.map((e) => [e.status, e]))

  // Find active index
  const activeIndex = ALL_STEPS.findIndex((s) => s.status === currentStatus)

  const stepsToShow =
    currentStatus === 'cancelled'
      ? [
          ...ALL_STEPS.slice(0, Math.max(activeIndex, 0)),
          { status: 'cancelled', label: 'Ride Cancelled' },
        ]
      : ALL_STEPS

  return (
    <ol role="list" className="relative space-y-0">
      {stepsToShow.map((step, idx) => {
        const isDone = completedStatuses.has(step.status) && step.status !== currentStatus
        const isActive = step.status === currentStatus
        const isPending = !isDone && !isActive
        const event = eventByStatus[step.status]
        const isLast = idx === stepsToShow.length - 1

        return (
          <li
            key={step.status}
            role="listitem"
            aria-label={`Step ${idx + 1}: ${step.label}, ${isActive ? 'current' : isDone ? 'completed' : 'pending'}`}
            className="flex gap-4 relative"
          >
            {/* Connector line */}
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[11px] top-[22px] bottom-0 w-0.5',
                  isDone ? 'bg-[#0077B6]' : 'bg-slate-200',
                )}
                aria-hidden="true"
              />
            )}

            {/* Node */}
            <div className="relative z-10 flex-shrink-0 mt-0.5">
              {isDone ? (
                <span className="w-6 h-6 rounded-full bg-[#0077B6] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                </span>
              ) : isActive ? (
                <span className="w-6 h-6 rounded-full bg-white border-2 border-[#0077B6] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#0077B6] animate-pulse" aria-hidden="true" />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <Circle className="w-3 h-3 text-slate-300" aria-hidden="true" />
                </span>
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-6 min-w-0', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  isDone || isActive ? 'text-slate-800' : 'text-slate-400',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {step.label}
              </p>
              {event?.timestamp ? (
                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                  {formatTime(event.timestamp)}
                  {event.changedBy && ` · ${event.changedBy}`}
                </p>
              ) : (
                <p className="text-xs text-slate-300 mt-0.5">—</p>
              )}
              {event?.note && (
                <p className="text-xs text-slate-500 mt-1 italic">{event.note}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
