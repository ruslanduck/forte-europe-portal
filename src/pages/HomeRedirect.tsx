import { Navigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { ErrorMessage, Loading } from '../components/Status'
import { Header } from '../components/Header'
import { useI18n } from '../i18n'

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
  const { t } = useI18n()
  if (error) return <Message text={error} />
  if (!data) return <Loading />
  const deal = data.deals[0]
  if (!deal) return <Message text={t('deals.none')} />
  return <Navigate to={`/deals/${deal.id}`} replace />
}
