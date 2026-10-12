import { Navigate } from 'react-router-dom'
import { api } from '../api/client'
import type { DealSummary } from '../api/types'
import { useApi } from '../lib/useApi'
import { ErrorMessage, Loading } from '../components/Status'
import { Header } from '../components/Header'

// Default deal: the nearest upcoming one; if all are in the past, the most recent.
function pickDefault(deals: DealSummary[]) {
  const today = new Date().toISOString().slice(0, 10)
  const dated = deals.filter((d) => d.startDate)
  const upcoming = dated
    .filter((d) => (d.endDate ?? d.startDate!) >= today)
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!))
  if (upcoming.length) return upcoming[0]
  const past = dated.sort((a, b) => b.startDate!.localeCompare(a.startDate!))
  return past[0] ?? deals[0]
}

function Message({ text }: { text: string }) {
  return (
    <>
      <Header />
      <main className="container page">
        <ErrorMessage message={text} />
      </main>
    </>
  )
}

export function HomeRedirect() {
  const { data, error } = useApi((t) => api.listDeals(t), [])
  if (error) return <Message text={error} />
  if (!data) return <Loading />
  const deal = pickDefault(data.deals)
  if (!deal) return <Message text="No proposals are shared with this account yet." />
  return <Navigate to={`/deals/${deal.id}`} replace />
}
