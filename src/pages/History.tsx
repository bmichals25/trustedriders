import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, History as HistoryIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import TopBar from '@/components/shared/TopBar'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import { MOCK_RIDES } from '@/data/mock'
import { formatTime, formatDate, cn } from '@/lib/utils'
import type { NEMTRide } from '@/types/nemt'

interface OutletCtx { onMobileMenuClick: () => void }

type SortKey = 'scheduledTime' | 'passenger' | 'status' | 'driver'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60" aria-hidden="true" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-[#0077B6]" aria-hidden="true" />
    : <ChevronDown className="w-3 h-3 text-[#0077B6]" aria-hidden="true" />
}

export default function History() {
  const { onMobileMenuClick } = useOutletContext<OutletCtx>()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('scheduledTime')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_RIDES.filter((r) =>
      q === '' ||
      r.passenger.name.toLowerCase().includes(q) ||
      r.confirmationNumber.toLowerCase().includes(q) ||
      r.driver?.name.toLowerCase().includes(q),
    )
  }, [search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'scheduledTime') {
        cmp = new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      } else if (sortKey === 'passenger') {
        cmp = a.passenger.name.localeCompare(b.passenger.name)
      } else if (sortKey === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortKey === 'driver') {
        cmp = (a.driver?.name ?? '').localeCompare(b.driver?.name ?? '')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const thClass = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none cursor-pointer hover:text-slate-700 group'

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <TopBar
        title="Ride History"
        subtitle="All past rides"
        onMenuClick={onMobileMenuClick}
        actions={[{ label: 'Export', icon: ChevronDown, onClick: () => {}, variant: 'secondary' }]}
      />

      {/* Table card */}
      <div className="mt-4 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              aria-label="Search ride history"
              className="h-9 w-full pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-md
                         focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6] outline-none
                         transition-colors placeholder:text-slate-400"
            />
          </div>
          <span className="text-sm text-slate-500 ml-auto">{filtered.length} rides</span>
        </div>

        {/* Responsive table */}
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm"
            role="grid"
            aria-label="Ride History"
          >
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={thClass} onClick={() => handleSort('scheduledTime')} aria-sort={sortKey === 'scheduledTime' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <span className="flex items-center gap-1">Date / Time <SortIcon col="scheduledTime" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Confirmation #
                </th>
                <th className={thClass} onClick={() => handleSort('passenger')} aria-sort={sortKey === 'passenger' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <span className="flex items-center gap-1">Passenger <SortIcon col="passenger" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th className={thClass} onClick={() => handleSort('status')} aria-sort={sortKey === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <span className="flex items-center gap-1">Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th className={thClass} onClick={() => handleSort('driver')} aria-sort={sortKey === 'driver' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <span className="flex items-center gap-1">Driver <SortIcon col="driver" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Chaperone
                </th>
                <th className="px-4 py-3 w-10" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={HistoryIcon}
                      title={search ? `No rides matching "${search}"` : 'No ride history'}
                      body="Completed rides will appear here."
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((ride) => (
                  <RideRow key={ride.id} ride={ride} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="h-8 w-8 text-xs rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`gap-${p}`} className="text-slate-400 text-xs px-1">…</span>
                  )}
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={cn(
                      'h-8 w-8 text-xs rounded-md border transition-colors',
                      p === page
                        ? 'bg-[#0077B6] text-white border-[#0077B6]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                    )}
                  >
                    {p}
                  </button>
                </>
              ))
            }

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="h-8 w-8 text-xs rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RideRow({ ride }: { ride: NEMTRide }) {
  return (
    <tr
      className={cn(
        'border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer transition-colors duration-100',
        ride.status === 'cancelled' && 'opacity-60',
      )}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && undefined}
      aria-label={`Ride ${ride.confirmationNumber} for ${ride.passenger.name}`}
    >
      <td className="px-4 py-3 text-slate-600 tabular-nums whitespace-nowrap">
        <div className="text-xs text-slate-400">{formatDate(ride.scheduledTime)}</div>
        <div className="text-sm font-medium text-slate-700">{formatTime(ride.scheduledTime)}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 font-mono">{ride.confirmationNumber}</td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-800">{ride.passenger.name}</p>
        <p className="text-xs text-slate-400 truncate max-w-[160px]">{ride.pickupAddress.split(',')[0]}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={ride.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {ride.driver?.name ?? <span className="text-slate-400 italic">Unassigned</span>}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {ride.chaperone?.name ?? <span className="text-slate-400 italic">—</span>}
      </td>
      <td className="px-4 py-3">
        <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
      </td>
    </tr>
  )
}
