import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Navigation, Users, UserCheck,
  History, Settings, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/',           icon: LayoutDashboard },
  { label: 'Active Rides', href: '/rides',       icon: Navigation },
  { label: 'Drivers',      href: '/drivers',     icon: Users },
  { label: 'Chaperones',   href: '/chaperones',  icon: UserCheck },
  { label: 'History',      href: '/history',     icon: History },
]

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ open, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 flex-shrink-0 justify-between">
        <div className={cn('flex items-center gap-2 overflow-hidden', !open && 'lg:justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-[#0077B6] flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          {(open || mobileOpen !== undefined) && (
            <span className={cn('font-bold text-white text-base tracking-tight whitespace-nowrap', !open && 'lg:hidden')}>
              TrustedRiders
            </span>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          className="hidden lg:flex w-6 h-6 rounded-md hover:bg-slate-800 items-center justify-center text-slate-400 transition-colors flex-shrink-0"
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Mobile close */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="lg:hidden w-7 h-7 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.href)

          return (
            <NavLink
              key={item.href}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={!open ? item.label : undefined}
              title={!open ? item.label : undefined}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
                'transition-colors duration-150 outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#0077B6]/50 focus-visible:ring-offset-slate-900 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-[#0077B6]/20 text-[#0077B6] border-l-2 border-[#0077B6] -ml-px pl-[11px]'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                !open && 'lg:justify-center lg:px-2',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className={cn('truncate', !open && 'lg:hidden')}>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-1 border-t border-slate-800 pt-3">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          return (
            <NavLink
              key={item.href}
              to={item.href}
              aria-label={!open ? item.label : undefined}
              title={!open ? item.label : undefined}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
                'transition-colors duration-150 outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#0077B6]/50',
                isActive
                  ? 'bg-[#0077B6]/20 text-[#0077B6]'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                !open && 'lg:justify-center lg:px-2',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className={cn('truncate', !open && 'lg:hidden')}>{item.label}</span>
            </NavLink>
          )
        })}
      </div>

      {/* User */}
      <div className={cn(
        'h-16 flex items-center gap-3 px-4 border-t border-slate-800 flex-shrink-0',
        !open && 'lg:justify-center lg:px-2',
      )}>
        <div className="w-8 h-8 rounded-full bg-[#0077B6]/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-[#0077B6]">D</span>
        </div>
        <div className={cn('flex flex-col min-w-0', !open && 'lg:hidden')}>
          <span className="text-slate-200 text-sm font-medium truncate">Dispatcher</span>
          <span className="text-slate-500 text-xs truncate">dispatch@trustedriders.com</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-slate-900 z-30',
          'border-r border-slate-800 transition-all duration-200 ease-in-out',
          open ? 'w-64' : 'w-16',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile: overlay + drawer */}
      {mobileOpen !== undefined && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              'lg:hidden fixed inset-0 bg-black/50 z-20 transition-opacity duration-200',
              mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            )}
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            className={cn(
              'lg:hidden fixed left-0 top-0 h-screen w-72 bg-slate-900 z-30',
              'border-r border-slate-800 transition-transform duration-200 ease-out flex flex-col',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
            aria-label="Navigation drawer"
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
