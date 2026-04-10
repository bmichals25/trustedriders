import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, MapPin, User, Car as CarIcon, UserCheck as ChaperonIcon } from 'lucide-react'
import TopBar from '@/components/shared/TopBar'
import RideCard from '@/components/shared/RideCard'
import StatusBadge from '@/components/shared/StatusBadge'
import RideTimeline from '@/components/shared/RideTimeline'
import EmptyState from '@/components/shared/EmptyState'
import { MOCK_RIDES } from '@/data/mock'
import { formatTime, getInitials, getAvatarColor, cn } from '@/lib/utils'
import type { NEMTRide, RideStatus } from '@/types/nemt'

interface OutletCtx { onMobileMenuClick: () => void }

const STATUS_FILTERS: { label: string; value: RideStatus | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Scheduled',   value: 'scheduled' },
  { label: 'En Route',    value: 'en-route' },
  { label: 'In Transit',  value: 'in-transit' },
  { label: 'Arrived',     value: 'arrived' },
]

function RideDetailPanel({ ride, onClose }: { ride: NEMTRide; onClose: () => void }) {
  const driverAvatar = ride.driver ? getAvatarColor(ride.driver.name) : ''
  const chapAvatar   = ride.chaperone ? getAvatarColor(ride.chaperone.name) : ''

  return (
    <motion.aside
      key="panel"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white shadow-xl border-l border-slate-200 z-40 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Ride details"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close ride details"
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 -ml-1 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-slate-800">
            {ride.confirmationNumber}
          </h2>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Meta */}
        <p className="text-sm text-slate-500">
          Scheduled {formatTime(ride.scheduledTime)}
          {ride.actualPickupTime && ` · Picked up ${formatTime(ride.actualPickupTime)}`}
        </p>

        {/* Passenger */}
        <section aria-labelledby="passenger-section">
          <h3 id="passenger-section" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Passenger
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 space-y-1.5">
            <p className="text-base font-semibold text-slate-800">{ride.passenger.name}</p>
            <a
              href={`tel:${ride.passenger.phone}`}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0077B6] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              {ride.passenger.phone}
            </a>
            {ride.passenger.accessibilityNeeds && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">
                {ride.passenger.accessibilityNeeds}
              </p>
            )}
            {ride.passenger.medicalNotes && (
              <p className="text-sm text-slate-500 italic border-t border-slate-100 pt-2 mt-2">
                {ride.passenger.medicalNotes}
              </p>
            )}
          </div>
        </section>

        {/* Route */}
        <section aria-labelledby="route-section">
          <h3 id="route-section" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Route
          </h3>
          <div className="space-y-1">
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#0077B6] mt-1.5 flex-shrink-0" />
              <span>{ride.pickupAddress}</span>
            </div>
            <div className="ml-[3px] w-0.5 h-4 bg-slate-200" />
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <MapPin className="w-2 h-2 text-amber-500 mt-1.5 flex-shrink-0 fill-amber-500" />
              <span>{ride.dropoffAddress}</span>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="mt-3 h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            Map view — coming soon
          </div>
        </section>

        {/* Assignments */}
        <section aria-labelledby="assignments-section">
          <h3 id="assignments-section" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Assignments
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {ride.driver ? (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CarIcon className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0', driverAvatar)}>
                    {getInitials(ride.driver.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{ride.driver.name}</p>
                    <a href={`tel:${ride.driver.phone}`} className="text-xs text-slate-500 hover:text-[#0077B6] transition-colors">
                      {ride.driver.phone}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-center text-xs text-slate-400 italic">
                No driver assigned
              </div>
            )}

            {ride.chaperone ? (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ChaperonIcon className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chaperone</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0', chapAvatar)}>
                    {getInitials(ride.chaperone.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{ride.chaperone.name}</p>
                    <a href={`tel:${ride.chaperone.phone}`} className="text-xs text-slate-500 hover:text-[#0077B6] transition-colors">
                      {ride.chaperone.phone}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-center text-xs text-slate-400 italic">
                No chaperone assigned
              </div>
            )}
          </div>
        </section>

        {/* Timeline */}
        <section aria-labelledby="timeline-section">
          <h3 id="timeline-section" className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Ride Progress
          </h3>
          <RideTimeline events={ride.timeline} currentStatus={ride.status} />
        </section>
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0 border-t border-slate-200 p-4 flex items-center gap-2">
        <button className="flex-1 h-9 bg-[#0077B6] hover:bg-[#005F8E] text-white text-sm font-medium rounded-md transition-colors">
          Update Status
        </button>
        <button className="h-9 px-4 border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors">
          Reassign
        </button>
        <button className="h-9 px-4 border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors">
          Cancel
        </button>
      </div>
    </motion.aside>
  )
}

export default function ActiveRides() {
  const { onMobileMenuClick } = useOutletContext<OutletCtx>()
  const [statusFilter, setStatusFilter] = useState<RideStatus | 'all'>('all')
  const [selectedRide, setSelectedRide] = useState<NEMTRide | null>(null)

  const activeRides = useMemo(() =>
    MOCK_RIDES.filter((r) =>
      statusFilter === 'all'
        ? !['completed', 'cancelled', 'no-show'].includes(r.status)
        : r.status === statusFilter,
    ),
  [statusFilter])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <TopBar
        title="Active Rides"
        subtitle={`${activeRides.length} ride${activeRides.length !== 1 ? 's' : ''} in progress`}
        onMenuClick={onMobileMenuClick}
        actions={[{ label: 'New Ride', onClick: () => {} }]}
      />

      {/* Status filter tabs */}
      <div className="flex gap-1 mt-4 mb-4 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={statusFilter === f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'h-8 px-3 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-shrink-0',
              statusFilter === f.value
                ? 'bg-[#0077B6] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ride grid */}
      {activeRides.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 mt-4">
          <EmptyState
            icon={CarIcon}
            title={statusFilter === 'all' ? 'No active rides' : `No rides with status "${statusFilter}"`}
            body="Active rides will appear here once dispatched."
            action={statusFilter !== 'all' ? { label: 'Show all', onClick: () => setStatusFilter('all') } : undefined}
          />
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {activeRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              selected={selectedRide?.id === ride.id}
              onClick={() => setSelectedRide(ride)}
            />
          ))}
        </motion.div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedRide && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setSelectedRide(null)}
              aria-hidden="true"
            />
            <RideDetailPanel ride={selectedRide} onClose={() => setSelectedRide(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
