import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  body?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {body && <p className="text-xs text-slate-400 mt-1 max-w-xs">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 h-9 px-4 text-sm font-medium bg-[#0077B6] hover:bg-[#005F8E] text-white rounded-md transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
