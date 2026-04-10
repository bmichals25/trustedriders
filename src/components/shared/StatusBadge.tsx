import { cn } from '@/lib/utils'
import type { RideStatus, DriverStatus, ChaperoneStatus } from '@/types/nemt'

type Status = RideStatus | DriverStatus | ChaperoneStatus

interface StatusConfig {
  label: string
  classes: string
  dotClasses: string
  pulse?: boolean
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  scheduled:  { label: 'Scheduled',  classes: 'bg-blue-50 text-blue-700 border-blue-200',   dotClasses: 'bg-blue-600' },
  'en-route': { label: 'En Route',   classes: 'bg-amber-50 text-amber-700 border-amber-200', dotClasses: 'bg-amber-600', pulse: true },
  'picked-up':{ label: 'Picked Up',  classes: 'bg-blue-50 text-blue-700 border-blue-200',   dotClasses: 'bg-blue-600', pulse: true },
  'in-transit':{ label: 'In Transit', classes: 'bg-purple-50 text-purple-700 border-purple-200', dotClasses: 'bg-purple-600', pulse: true },
  arrived:    { label: 'Arrived',    classes: 'bg-green-50 text-green-700 border-green-200', dotClasses: 'bg-green-600' },
  completed:  { label: 'Completed',  classes: 'bg-slate-100 text-slate-600 border-slate-200', dotClasses: 'bg-slate-400' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-50 text-red-700 border-red-200',       dotClasses: 'bg-red-600' },
  'no-show':  { label: 'No Show',    classes: 'bg-orange-50 text-orange-700 border-orange-200', dotClasses: 'bg-orange-600' },
  delayed:    { label: 'Delayed',    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotClasses: 'bg-yellow-600', pulse: true },
  available:  { label: 'Available',  classes: 'bg-green-50 text-green-700 border-green-200', dotClasses: 'bg-green-600' },
  'on-ride':  { label: 'On Ride',    classes: 'bg-blue-50 text-blue-700 border-blue-200',    dotClasses: 'bg-blue-600', pulse: true },
  'off-duty': { label: 'Off Duty',   classes: 'bg-slate-100 text-slate-500 border-slate-200', dotClasses: 'bg-slate-400' },
}

interface StatusBadgeProps {
  status: Status | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1 font-medium',
  lg: 'text-sm px-3 py-1 font-medium',
}

export default function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClasses: 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        SIZE_CLASSES[size],
        config.classes,
        className,
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          config.dotClasses,
          config.pulse && 'animate-pulse',
        )}
      />
      {config.label}
    </span>
  )
}
