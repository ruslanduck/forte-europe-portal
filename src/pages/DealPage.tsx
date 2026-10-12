import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { formatLongDate } from '../lib/format'
import { Header } from '../components/Header'
import { ManagerCard } from '../components/ManagerCard'
import { ScheduleCard } from '../components/ScheduleCard'
import { ErrorMessage, Loading } from '../components/Status'

export function DealPage() {
  const { dealId = '' } = useParams()
  const { data, error } = useApi((t) => api.getDeal(t, dealId), [dealId])
  const deal = data?.deal

  return (
    <>
      <Header dealId={dealId} />
      <main className="container page">
        {error && <ErrorMessage message={error} />}
        {!deal && !error && <Loading />}
        {deal && (
          <>
            <section className="hero">
              <p className="eyebrow">Preliminary proposal for services</p>
              {deal.preparedFor && <p className="hero-for">Prepared exclusively for {deal.preparedFor}</p>}
              <h1 className="hero-title">{deal.title}</h1>
              <dl className="hero-facts">
                {deal.startDate && (
                  <div>
                    <dt>Dates</dt>
                    <dd>
                      {formatLongDate(deal.startDate)}
                      {deal.endDate && deal.endDate !== deal.startDate && <> – {formatLongDate(deal.endDate)}</>}
                    </dd>
                  </div>
                )}
                {deal.destination && (
                  <div>
                    <dt>Destination</dt>
                    <dd>{deal.destination}</dd>
                  </div>
                )}
                {deal.pax != null && (
                  <div>
                    <dt>Guests</dt>
                    <dd>{deal.pax} PAX</dd>
                  </div>
                )}
              </dl>
            </section>

            <div className="layout">
              <aside className="sidebar">
                <h2 className="section-label">
                  {deal.managers.length > 1 ? 'Your Forte Europe contacts' : 'Your Forte Europe contact'}
                </h2>
                {deal.managers.map((m) => (
                  <ManagerCard key={m.id} manager={m} />
                ))}
              </aside>

              <section className="content">
                <h2 className="section-label">Programme</h2>
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
                    Full proposal
                  </Link>
                  <Link className="btn btn-accent" to={`/deals/${deal.id}/costing`}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M4 3h12v14H4zM7 7h6M7 10h6M7 13h3" />
                    </svg>
                    Costing
                  </Link>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </>
  )
}
