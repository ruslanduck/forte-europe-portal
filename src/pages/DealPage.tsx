import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { DealSummary } from '../api/types'
import { useApi } from '../lib/useApi'
import { useTrackView } from '../lib/trackView'
import { usePrefetchDeal } from '../lib/prefetch'
import { formatLongDate } from '../lib/format'
import { Header } from '../components/Header'
import { ManagerCard } from '../components/ManagerCard'
import { ScheduleCard } from '../components/ScheduleCard'
import { ErrorMessage, Loading } from '../components/Status'
import { contentLang, keys, useI18n, type T } from '../i18n'

function Hero({ deal, preparedFor, t }: { deal: DealSummary; preparedFor?: string; t: T }) {
  return (
    <section className="hero">
      <p className="eyebrow">{t('deal.eyebrow')}</p>
      {preparedFor && <p className="hero-for">{t('deal.preparedFor', { name: preparedFor })}</p>}
      <h1 className="hero-title">{deal.title}</h1>
      <dl className="hero-facts">
        {deal.startDate && (
          <div>
            <dt>{t('deal.dates')}</dt>
            <dd>
              {formatLongDate(deal.startDate)}
              {deal.endDate && deal.endDate !== deal.startDate && <> – {formatLongDate(deal.endDate)}</>}
            </dd>
          </div>
        )}
        {deal.destination && (
          <div>
            <dt>{t('deal.destination')}</dt>
            <dd>{deal.destination}</dd>
          </div>
        )}
        {deal.pax != null && (
          <div>
            <dt>{t('deal.guests')}</dt>
            <dd>{t('deal.pax', { n: deal.pax })}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

// Placeholder blocks in the shape of the manager card and schedule cards while the programme loads.
function ProgrammeSkeleton() {
  return (
    <div className="layout" aria-hidden="true">
      <aside className="sidebar">
        <div className="skeleton skeleton-manager" />
      </aside>
      <section className="content">
        <div className="skeleton-list">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-schedule" />
          ))}
        </div>
      </section>
    </div>
  )
}

export function DealPage() {
  const { dealId = '' } = useParams()
  const { lang, t, setDealLanguage } = useI18n()
  const { data, error } = useApi((tk) => api.getDeal(tk, dealId, contentLang(lang)), [dealId, lang], { cacheKey: keys.deal(dealId, lang) })
  // The deals list is small and usually already loaded, so the header shows at once while the programme loads.
  const { data: list } = useApi((tk) => api.listDeals(tk), [], { cacheKey: 'deals', revalidate: false })
  const deal = data?.deal
  const summary = deal ?? list?.deals.find((d) => d.id === dealId)
  usePrefetchDeal(dealId)
  // The deal's own language (Teamo) is the default until the visitor picks one. Read from the deals list,
  // which does not change with the language, so switching language cannot feed back into this value.
  const listed = list?.deals.find((d) => d.id === dealId)
  const dealLanguage = list ? listed?.language ?? 'en' : undefined
  useEffect(() => {
    if (dealLanguage) setDealLanguage(dealLanguage)
  }, [dealLanguage, setDealLanguage])
  useTrackView(dealId)

  return (
    <>
      <Header dealId={dealId} />
      <main className="container page">
        {error && <ErrorMessage message={error} />}
        {!summary && !error && <Loading label={t('deal.preparing')} />}
        {summary && !error && <Hero deal={summary} preparedFor={deal?.preparedFor} t={t} />}
        {summary && !deal && !error && (
          <>
            <Loading label={t('deal.loadingProgramme')} />
            <ProgrammeSkeleton />
          </>
        )}
        {deal && (
          <div className="layout">
            <aside className="sidebar">
              <h2 className="section-label">
                {deal.managers.length > 1 ? t('deal.contacts') : t('deal.contact')}
              </h2>
              {deal.managers.map((m) => (
                <ManagerCard key={m.id} manager={m} />
              ))}
            </aside>

            <section className="content">
              <h2 className="section-label">{t('deal.programme')}</h2>
              <ol className="schedules">
                {deal.schedules.map((s) => (
                  <ScheduleCard key={s.id} dealId={deal.id} schedule={s} />
                ))}
              </ol>

              <div className="actions">
                <Link className="btn btn-primary" to={`/deals/${deal.id}/proposal`}>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5 2h7l4 4v12H5zM12 2v4h4M8 11h6M8 14h6" />
                  </svg>
                  {t('deal.fullProposal')}
                </Link>
                <Link className="btn btn-accent" to={`/deals/${deal.id}/costing`}>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 3h12v14H4zM7 7h6M7 10h6M7 13h3" />
                  </svg>
                  {t('deal.costing')}
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  )
}
