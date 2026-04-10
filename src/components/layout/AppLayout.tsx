import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem('sidebar-open') !== 'false'
  })

  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-open', String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Sidebar open={sidebarOpen} onToggle={handleToggle} />
      <div
        className="flex min-h-screen flex-col pt-14 transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? 240 : 0 }}
      >
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
