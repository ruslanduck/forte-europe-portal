import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { useTrackView } from '../lib/trackView'
import { usePrefetchDeal } from '../lib/prefetch'
import { Header } from '../components/Header'
import { CostingDownloads, CostingTables } from '../components/CostingView'
import { ErrorMessage, Loading } from '../components/Status'
import { contentLang, keys, useI18n } from '../i18n'

export function CostingPage() {
  const { dealId = '' } = useParams()
  const { lang, t } = useI18n()
  const { data, error } = useApi((tk) => api.getCosting(tk, dealId, contentLang(lang)), [dealId, lang], { cacheKey: keys.costing(dealId, lang) })
  const costing = data?.costing
  usePrefetchDeal(dealId)
  useTrackView(dealId)

  return (
    <>
      <Header dealId={dealId} />
      <main className="container page">
        <Link className="back" to={`/deals/${dealId}`}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          {t('back')}
        </Link>
        {error && <ErrorMessage message={error} />}
        {!costing && !error && <Loading label={t('costing.calculating')} />}
        {costing && (
          <>
            <section className="hero hero-compact">
              <p className="eyebrow">{t('costing.eyebrow')}</p>
              <h1 className="hero-title">{costing.title}</h1>
              {costing.showPrices && (
                <p className="hero-note">{costing.vatIncluded ? t('costing.pricesIncl') : t('costing.pricesExcl')}</p>
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
