import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem('sidebar-open') !== 'false'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-open', String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset by sidebar width on lg */}
      <div
        className="flex min-h-screen flex-col transition-[margin] duration-200 ease-in-out"
        style={{ marginLeft: sidebarOpen ? 256 : 64 }}
      >
        {/* Apply margin only on large screens */}
        <div className="lg:hidden" style={{ marginLeft: 0 }} />
        <main className="flex-1 min-w-0">
          <Outlet context={{ onMobileMenuClick: () => setMobileOpen(true) }} />
        </main>
      </div>
    </div>
  )
}
