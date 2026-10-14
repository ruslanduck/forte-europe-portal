import { useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

// One visit per deal per half hour in this tab, so moving between the deal, its events and the costing
// is a single view in Teamo rather than one comment per click.
const WINDOW_MS = 30 * 60_000

// Tells the backend a client opened this deal; it stamps Last Viewed and comments on the deal in Teamo.
// Staff visits are not recorded. Fire and forget: a failure never affects the page.
export function useTrackView(dealId: string) {
  const { session } = useAuth()
  const token = session?.token
  const isClient = session?.contact.role !== 'admin'

  useEffect(() => {
    if (!token || !dealId || !isClient) return
    // Under the API cache prefix, so logging out clears it with the rest of the session data.
    const key = `fe-cache:viewed:${dealId}`
    try {
      const last = Number(sessionStorage.getItem(key))
      if (last && Date.now() - last < WINDOW_MS) return
      sessionStorage.setItem(key, String(Date.now()))
    } catch {
      // Storage blocked: record the view anyway.
    }
    api.trackView(token, dealId).catch(() => {})
  }, [token, dealId, isClient])
}
