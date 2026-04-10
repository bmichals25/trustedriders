import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, RequireAuth } from '@/components/auth/AuthProvider'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Pipeline from '@/pages/Pipeline'
import MyTasks from '@/pages/MyTasks'
import Team from '@/pages/Team'
import Agents from '@/pages/Agents'
import AgentEditor from '@/pages/AgentEditor'
import Settings from '@/pages/Settings'
import Autopilot from '@/pages/Autopilot'
import Login from '@/pages/Login'
import StripeOnboarding from '@/pages/StripeOnboarding'
import VentureDetail from '@/pages/VentureDetail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/tasks" element={<MyTasks />} />
            <Route path="/team" element={<Team />} />
            <Route path="/autopilot" element={<Autopilot />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stripe" element={<StripeOnboarding />} />
          </Route>
          <Route
            path="/venture/:id"
            element={
              <RequireAuth>
                <VentureDetail />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
