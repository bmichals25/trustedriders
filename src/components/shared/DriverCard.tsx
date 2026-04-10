import { useState } from 'react'
import { Phone, Car, ChevronDown, ChevronUp, Heart } from 'lucide-react'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import type { NEMTDriver, NEMTChaperone } from '@/types/nemt'

// ── Driver Card ─────────────────────────────────────────────────────────────

interface DriverCardProps {
  driver: NEMTDriver
  compact?: boolean
  className?: string
}

export function DriverCard({ driver, compact, className }: DriverCardProps) {
  const [expanded, setExpanded] = useState(false)
  const avatarColor = getAvatarColor(driver.name)

  return (
    <article
      aria-label={`${driver.name}, Driver, ${driver.status}`}
      className={cn(
        'bg-white rounded-lg border border-slate-200 shadow-sm',
        'transition-all duration-150',
        driver.status === 'off-duty' && 'opacity-70',
        expanded ? 'border-[#0077B6] ring-1 ring-[#0077B6]/20' : 'hover:shadow-md hover:border-slate-300',
        compact ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
      >
        {/* Avatar */}
        <span
          className={cn(
            'rounded-full flex items-center justify-center flex-shrink-0 font-semibold',
            avatarColor,
            compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm',
          )}
          aria-hidden="true"
        >
          {getInitials(driver.name)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{driver.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Car className="w-3 h-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs text-slate-500 truncate">{driver.vehicle}</span>
          </div>
          {driver.currentRideId && (
            <p className="text-xs text-[#0077B6] font-medium mt-1">Ride #{driver.currentRideId}</p>
          )}
        </div>

        {/* Status + toggle */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={driver.status} size="sm" />
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          }
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <a
            href={`tel:${driver.phone}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0077B6] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            {driver.phone}
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Car className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>{driver.licensePlate} · {driver.vehicle}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Rides today</p>
              <p className="text-sm font-semibold text-slate-700">{driver.ridesTotal}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">On-time rate</p>
              <p className="text-sm font-semibold text-slate-700">{driver.onTimeRate}%</p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

// ── Chaperone Card ───────────────────────────────────────────────────────────

interface ChaperoneCardProps {
  chaperone: NEMTChaperone
  compact?: boolean
  className?: string
}

export function ChaperoneCard({ chaperone, compact, className }: ChaperoneCardProps) {
  const [expanded, setExpanded] = useState(false)
  const avatarColor = getAvatarColor(chaperone.name)
  const isMedTrained = chaperone.certifications.some((c) =>
    ['CNA', 'RN', 'LPN'].includes(c),
  )

  return (
    <article
      aria-label={`${chaperone.name}, Chaperone, ${chaperone.status}`}
      className={cn(
        'bg-white rounded-lg border border-slate-200 shadow-sm',
        'transition-all duration-150',
        chaperone.status === 'off-duty' && 'opacity-70',
        expanded ? 'border-[#0077B6] ring-1 ring-[#0077B6]/20' : 'hover:shadow-md hover:border-slate-300',
        compact ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
      >
        <span
          className={cn(
            'rounded-full flex items-center justify-center flex-shrink-0 font-semibold',
            avatarColor,
            compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm',
          )}
          aria-hidden="true"
        >
          {getInitials(chaperone.name)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800 truncate">{chaperone.name}</p>
            {isMedTrained && (
              <Heart
                className="w-3 h-3 text-green-600 flex-shrink-0"
                aria-label="Medically trained"
              />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {chaperone.certifications.join(' · ')}
          </p>
          {chaperone.currentRideId && (
            <p className="text-xs text-[#0077B6] font-medium mt-1">Ride #{chaperone.currentRideId}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={chaperone.status} size="sm" />
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          }
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <a
            href={`tel:${chaperone.phone}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0077B6] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            {chaperone.phone}
          </a>
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Rides today</p>
              <p className="text-sm font-semibold text-slate-700">{chaperone.ridesTotal}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
