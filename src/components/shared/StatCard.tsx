import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: string; positive: boolean }
  iconColorClass?: string
  iconBgClass?: string
  className?: string
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  iconColorClass = 'text-[#0077B6]',
  iconBgClass = 'bg-blue-50',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 shadow-sm p-5',
        'hover:shadow-md transition-shadow duration-150',
        className,
      )}
      aria-label={`${value} ${label}${trend ? `, ${trend.positive ? 'up' : 'down'} ${trend.value}` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBgClass)}>
          <Icon className={cn('w-5 h-5', iconColorClass)} aria-hidden="true" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium flex items-center gap-0.5',
              trend.positive ? 'text-green-600' : 'text-red-500',
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-slate-800 tabular-nums">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
