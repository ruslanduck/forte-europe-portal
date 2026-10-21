import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useI18n } from './i18n'
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

// A new page opens at the top, not at the scroll position of the page the user came from.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function App() {
  const { t } = useI18n()
  return (
    <div className="app">
      <ScrollToTop />
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
          {t('footer', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  )
}
