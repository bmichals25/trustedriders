import { type LucideIcon, Plus, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Breadcrumb {
  label: string
  href?: string
}

interface ActionButton {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

interface TopBarProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ActionButton[]
  onMenuClick?: () => void
  className?: string
}

export default function TopBar({
  title,
  subtitle,
  breadcrumbs,
  actions = [],
  onMenuClick,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        'bg-white border-b border-slate-200 px-4 sm:px-6 py-4',
        'flex items-start justify-between gap-4 sticky top-0 z-20',
        className,
      )}
    >
      {/* Left */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0 mt-0.5"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col gap-0.5 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-xs text-slate-400">
                {breadcrumbs.map((crumb, i) => (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden="true">/</span>}
                    {i === breadcrumbs.length - 1 ? (
                      <span aria-current="page" className="text-slate-600">{crumb.label}</span>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="text-xl font-semibold text-slate-800 leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions.map((action) => {
            const Icon = action.icon ?? Plus
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                aria-label={action.label}
                className={cn(
                  'h-9 px-4 text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors',
                  action.variant === 'secondary'
                    ? 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    : 'bg-[#0077B6] hover:bg-[#005F8E] text-white',
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
