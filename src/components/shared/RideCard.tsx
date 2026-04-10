import { MoreHorizontal, MapPin } from 'lucide-react'
import { cn, getInitials, getAvatarColor, formatTime } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import type { NEMTRide } from '@/types/nemt'

interface RideCardProps {
  ride: NEMTRide
  onClick?: () => void
  selected?: boolean
  className?: string
}

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const colorClass = getAvatarColor(name)
  return (
    <span
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-medium',
        colorClass,
        size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs',
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}

export default function RideCard({ ride, onClick, selected, className }: RideCardProps) {
  return (
    <article
      role="article"
      aria-label={`Ride for ${ride.passenger.name}, ${ride.status}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={cn(
        'bg-white rounded-lg border shadow-sm p-4 cursor-pointer',
        'hover:shadow-md hover:border-slate-300 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077B6] focus-visible:ring-offset-2',
        selected
          ? 'border-[#0077B6] ring-1 ring-[#0077B6]/20'
          : 'border-slate-200',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={ride.status} size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {formatTime(ride.scheduledTime)}
          </span>
          <button
            aria-label="Ride options"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Passenger */}
      <p className="text-base font-semibold text-slate-800 mb-2 truncate">
        {ride.passenger.name}
      </p>

      {/* Route */}
      <div className="space-y-1.5 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0077B6] mt-1.5 flex-shrink-0" />
          <span className="truncate">{ride.pickupAddress}</span>
        </div>
        <div className="ml-[3px] w-0.5 h-2.5 bg-slate-200" />
        <div className="flex items-start gap-2">
          <MapPin className="w-2 h-2 text-amber-500 mt-1.5 flex-shrink-0 fill-amber-500" />
          <span className="truncate">{ride.dropoffAddress}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          {ride.driver && (
            <div className="flex items-center gap-1.5">
              <Avatar name={ride.driver.name} />
              <span className="text-xs text-slate-500 truncate max-w-[80px]">{ride.driver.name}</span>
            </div>
          )}
          {ride.chaperone && (
            <div className="flex items-center gap-1.5">
              <Avatar name={ride.chaperone.name} />
              <span className="text-xs text-slate-500 truncate max-w-[80px]">{ride.chaperone.name}</span>
            </div>
          )}
          {!ride.driver && !ride.chaperone && (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}
        </div>
        {ride.eta && (
          <span className="text-xs text-slate-500 tabular-nums">ETA {ride.eta}</span>
        )}
      </div>
    </article>
  )
}
