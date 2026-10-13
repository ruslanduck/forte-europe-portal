import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { usePrefetchDeal } from '../lib/prefetch'
import { Header } from '../components/Header'
import { CostingDownloads, CostingTables } from '../components/CostingView'
import { ErrorMessage, Loading } from '../components/Status'

export function CostingPage() {
  const { dealId = '' } = useParams()
  const { data, error } = useApi((t) => api.getCosting(t, dealId), [dealId], { cacheKey: `costing:${dealId}` })
  const costing = data?.costing
  usePrefetchDeal(dealId)

  return (
    <>
      <Header dealId={dealId} />
      <main className="container page">
        <Link className="back" to={`/deals/${dealId}`}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back to programme
        </Link>
        {error && <ErrorMessage message={error} />}
        {!costing && !error && <Loading label="Calculating your costing… this can take a few seconds" />}
        {costing && (
          <>
            <section className="hero hero-compact">
              <p className="eyebrow">Costing</p>
              <h1 className="hero-title">{costing.title}</h1>
              {costing.showPrices && (
                <p className="hero-note">All prices in EUR, {costing.vatIncluded ? 'VAT included' : 'excluding VAT'}.</p>
              )}
            </section>
            <CostingTables costing={costing} />
            <CostingDownloads costing={costing} />
          </>
        )}
      </main>
    </>
  )
}
