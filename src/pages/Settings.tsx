import { useOutletContext } from 'react-router-dom'
import { Bell, Shield, Users, Globe, ChevronRight } from 'lucide-react'
import TopBar from '@/components/shared/TopBar'

interface OutletCtx { onMobileMenuClick: () => void }

const SETTING_SECTIONS = [
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Manage alert preferences for rides, drivers, and delays',
    items: [
      { label: 'Ride status changes', description: 'Get notified when a ride status updates', enabled: true },
      { label: 'Driver offline alerts', description: 'Alert when a driver goes off-duty unexpectedly', enabled: true },
      { label: 'Overdue ride warnings', description: 'Warn when a ride exceeds expected ETA by 10+ min', enabled: false },
    ],
  },
  {
    id: 'operations',
    icon: Globe,
    title: 'Operations',
    description: 'Default settings for dispatch and scheduling',
    items: [
      { label: 'Auto-assign nearest driver', description: 'Automatically suggest the nearest available driver', enabled: false },
      { label: 'Require chaperone for all rides', description: 'Enforce chaperone assignment before dispatch', enabled: true },
    ],
  },
  {
    id: 'team',
    icon: Users,
    title: 'Team & Access',
    description: 'Manage dispatcher accounts and roles',
    href: '#',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security',
    description: 'Password, two-factor authentication, and session settings',
    href: '#',
  },
]

export default function Settings() {
  const { onMobileMenuClick } = useOutletContext<OutletCtx>()

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <TopBar
        title="Settings"
        subtitle="Manage application preferences"
        onMenuClick={onMobileMenuClick}
      />

      <div className="mt-4 space-y-4">
        {SETTING_SECTIONS.map((section) => {
          const Icon = section.icon

          if (section.href) {
            return (
              <a
                key={section.id}
                href={section.href}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex items-center gap-4
                           hover:shadow-md hover:border-slate-300 transition-all duration-150 block"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
              </a>
            )
          }

          return (
            <div key={section.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>
              </div>

              {section.items && (
                <div className="divide-y divide-slate-100">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                      <Toggle enabled={item.enabled} label={item.label} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Toggle({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077B6] focus-visible:ring-offset-2 flex-shrink-0 ${
        enabled ? 'bg-[#0077B6]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
