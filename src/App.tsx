import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from './auth/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { HomeRedirect } from './pages/HomeRedirect'
import { DealPage } from './pages/DealPage'
import { EventPage } from './pages/EventPage'
import { ProposalPage } from './pages/ProposalPage'
import { CostingPage } from './pages/CostingPage'

function RequireAuth({ children }: { children: ReactElement }) {
  const { session } = useAuth()
  return session ? children : <Navigate to="/login" replace />
}

export function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><HomeRedirect /></RequireAuth>} />
        <Route path="/deals/:dealId" element={<RequireAuth><DealPage /></RequireAuth>} />
        <Route path="/deals/:dealId/events/:eventId" element={<RequireAuth><EventPage /></RequireAuth>} />
        <Route path="/deals/:dealId/proposal" element={<RequireAuth><ProposalPage /></RequireAuth>} />
        <Route path="/deals/:dealId/costing" element={<RequireAuth><CostingPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Forte Europe. All rights reserved. This information is privileged and confidential.
        </div>
      </footer>
    </div>
  )
}
