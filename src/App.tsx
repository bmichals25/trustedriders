import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import ActiveRides from '@/pages/ActiveRides'
import Drivers from '@/pages/Drivers'
import Chaperones from '@/pages/Chaperones'
import History from '@/pages/History'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/rides"      element={<ActiveRides />} />
          <Route path="/drivers"    element={<Drivers />} />
          <Route path="/chaperones" element={<Chaperones />} />
          <Route path="/history"    element={<History />} />
          <Route path="/settings"   element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
