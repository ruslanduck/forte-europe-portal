import { Navigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { ErrorMessage, Loading } from '../components/Status'
import { Header } from '../components/Header'

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

// The API lists deals newest first, so the client lands on the last deal added for them.
export function HomeRedirect() {
  const { data, error } = useApi((t) => api.listDeals(t), [], { cacheKey: 'deals' })
  if (error) return <Message text={error} />
  if (!data) return <Loading />
  const deal = data.deals[0]
  if (!deal) return <Message text="No proposals are shared with this account yet." />
  return <Navigate to={`/deals/${deal.id}`} replace />
}
