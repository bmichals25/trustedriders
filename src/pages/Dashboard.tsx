import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Car, Users, UserCheck, TrendingUp, Clock,
  AlertTriangle, X,
} from 'lucide-react'
import TopBar from '@/components/shared/TopBar'
import StatCard from '@/components/shared/StatCard'
import RideCard from '@/components/shared/RideCard'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import { MOCK_RIDES, MOCK_STATS } from '@/data/mock'
import { formatTime } from '@/lib/utils'

interface OutletCtx { onMobileMenuClick: () => void }

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.05 } },
}

const ALERTS = [
  { id: 'a1', type: 'warning', message: 'Ride TR-10042 is approaching pickup time. Driver en route.' },
  { id: 'a2', type: 'info',    message: 'Chaperone Robert Cheng is now available.' },
]

export default function Dashboard() {
  const { onMobileMenuClick } = useOutletContext<OutletCtx>()
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const activeRides = MOCK_RIDES.filter(
    (r) => !['completed', 'cancelled', 'no-show'].includes(r.status),
  )
  const todaysSchedule = MOCK_RIDES.slice().sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime(),
  )
  const visibleAlerts = ALERTS.filter((a) => !dismissedAlerts.includes(a.id))

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto"
    >
      <TopBar
        title="Dashboard"
        subtitle="Apr 9, 2026 — operational overview"
        onMenuClick={onMobileMenuClick}
        actions={[{ label: 'New Ride', onClick: () => {} }]}
      />

      {/* Alerts */}
      {visibleAlerts.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
                alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-[#0077B6]'
              }`}
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="flex-1">{alert.message}</span>
              <button
                onClick={() => setDismissedAlerts((d) => [...d, alert.id])}
                aria-label="Dismiss alert"
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard
          icon={Car}
          label="Active Rides"
          value={MOCK_STATS.activeRides}
          trend={{ value: '2', positive: true }}
          iconBgClass="bg-blue-50"
          iconColorClass="text-[#0077B6]"
        />
        <StatCard
          icon={Users}
          label="Available Drivers"
          value={MOCK_STATS.availableDrivers}
          iconBgClass="bg-green-50"
          iconColorClass="text-green-600"
        />
        <StatCard
          icon={UserCheck}
          label="Available Chaperones"
          value={MOCK_STATS.availableChaperones}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          label="On-Time Rate"
          value={`${MOCK_STATS.onTimeRate}%`}
          trend={{ value: '3%', positive: true }}
          iconBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
      </motion.div>

      {/* Two columns: Active Rides + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Rides */}
        <motion.section variants={fadeUp} aria-labelledby="active-rides-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="active-rides-heading" className="text-base font-semibold text-slate-800">
              Active Rides
              <span className="ml-2 text-xs font-medium text-slate-400">{activeRides.length}</span>
            </h2>
          </div>
          {activeRides.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200">
              <EmptyState
                icon={Car}
                title="No active rides right now"
                body="Rides will appear here once they are dispatched."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {activeRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Today's Schedule */}
        <motion.section variants={fadeUp} aria-labelledby="schedule-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="schedule-heading" className="text-base font-semibold text-slate-800">
              Today's Schedule
              <span className="ml-2 text-xs font-medium text-slate-400">{todaysSchedule.length}</span>
            </h2>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {todaysSchedule.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No rides scheduled today"
                body="Create a new ride to get started."
                action={{ label: 'New Ride', onClick: () => {} }}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {todaysSchedule.map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 cursor-pointer transition-colors"
                    tabIndex={0}
                    role="button"
                    aria-label={`View ride for ${ride.passenger.name}`}
                  >
                    <div className="w-14 flex-shrink-0 text-center">
                      <span className="text-xs font-semibold text-slate-700 tabular-nums">
                        {formatTime(ride.scheduledTime)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{ride.passenger.name}</p>
                      <p className="text-xs text-slate-500 truncate">{ride.pickupAddress.split(',')[0]}</p>
                    </div>
                    <StatusBadge status={ride.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Duty summary footer */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Rides Today',   value: MOCK_STATS.totalRidesToday, icon: Car },
          { label: 'Drivers on Duty',     value: MOCK_STATS.driversOnDuty, icon: Users },
          { label: 'Chaperones on Duty',  value: MOCK_STATS.chaperonesOnDuty, icon: UserCheck },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
            <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xl font-bold text-slate-800 tabular-nums">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
