import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, UserCheck } from 'lucide-react'
import TopBar from '@/components/shared/TopBar'
import { ChaperoneCard } from '@/components/shared/DriverCard'
import EmptyState from '@/components/shared/EmptyState'
import { MOCK_CHAPERONES } from '@/data/mock'
import { cn } from '@/lib/utils'
import type { ChaperoneStatus } from '@/types/nemt'

interface OutletCtx { onMobileMenuClick: () => void }

const STATUS_TABS: { label: string; value: ChaperoneStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'On Ride',   value: 'on-ride' },
  { label: 'Off Duty',  value: 'off-duty' },
]

export default function Chaperones() {
  const { onMobileMenuClick } = useOutletContext<OutletCtx>()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ChaperoneStatus | 'all'>('all')

  const filtered = useMemo(() =>
    MOCK_CHAPERONES.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    }),
  [search, statusFilter])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <TopBar
        title="Chaperones"
        subtitle={`${MOCK_CHAPERONES.length} total chaperones`}
        onMenuClick={onMobileMenuClick}
      />

      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search chaperones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search chaperones"
            className="h-9 w-full pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-md
                       focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6] outline-none
                       transition-colors placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-1" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={statusFilter === tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'h-9 px-3 text-sm font-medium rounded-md whitespace-nowrap transition-colors',
                statusFilter === tab.value
                  ? 'bg-[#0077B6] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={UserCheck}
            title={search ? `No chaperones matching "${search}"` : 'No chaperones available'}
            body="Try adjusting your filters."
            action={search || statusFilter !== 'all'
              ? { label: 'Clear filters', onClick: () => { setSearch(''); setStatusFilter('all') } }
              : undefined
            }
          />
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((chaperone) => (
            <ChaperoneCard key={chaperone.id} chaperone={chaperone} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
