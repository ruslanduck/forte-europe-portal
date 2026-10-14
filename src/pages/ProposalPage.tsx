import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Deal, EventDetail, Schedule } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { prefetch, useApi } from '../lib/useApi'
import { useTrackView } from '../lib/trackView'
import { pool } from '../lib/prefetch'
import { sanitize, splitGallery } from '../lib/html'
import { formatLongDate, formatShortDate } from '../lib/format'
import { Header } from '../components/Header'
import { ManagerCard } from '../components/ManagerCard'
import { CostingDownloads, CostingTables } from '../components/CostingView'
import { ErrorMessage, Loading } from '../components/Status'

const eventKey = (dealId: string, scheduleId: string, eventId: string) => `event:${dealId}:${scheduleId}:${eventId}`

// Loads every event with a description (from the cache when the deal page already prefetched them).
// undefined = still loading, null = failed.
function useProgrammeEvents(deal: Deal | undefined) {
  const { session } = useAuth()
  const [events, setEvents] = useState<Record<string, EventDetail | null>>({})
  const token = session?.token

  useEffect(() => {
    if (!deal || !token) return
    let stopped = false
    const tasks = deal.schedules.flatMap((s) =>
      s.events
        .filter((e) => e.hasDescription)
        .map((e) => async () => {
          const key = eventKey(deal.id, s.id, e.id)
          const res = await prefetch(key, () => api.getEvent(token, deal.id, e.id, s.id))
          if (!stopped) setEvents((prev) => ({ ...prev, [key]: res?.event ?? null }))
        }),
    )
    pool(tasks)
    return () => {
      stopped = true
    }
  }, [deal, token])

  return events
}

// Resolves once every image on the page has loaded (or failed), so the PDF has no blank photos.
function imagesReady(root: ParentNode, timeoutMs = 20_000) {
  const pending = Array.from(root.querySelectorAll('img')).filter((img) => !img.complete)
  const all = Promise.all(
    pending.map(
      (img) =>
        new Promise((done) => {
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
        }),
    ),
  )
  return Promise.race([all, new Promise((r) => setTimeout(r, timeoutMs))])
}

function EventBlock({ event }: { event: EventDetail }) {
  const content = useMemo(() => splitGallery(event.descriptionHtml), [event])
  const mapLink = event.lat != null && event.lng != null ? `${event.lat},${event.lng}` : event.location
  return (
    <article className="proposal-event">
      <h3 className="proposal-event-name">{event.name}</h3>
      {content.gallery.length > 0 && (
        <div className={`event-gallery count-${Math.min(content.gallery.length, 4)}`}>
          {content.gallery.map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      )}
      {content.body.trim() && <div className="rich proposal-text" dangerouslySetInnerHTML={{ __html: content.body }} />}
      {event.location && mapLink && (
        <p className="event-location">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 15s5-4.5 5-8.5A5 5 0 0 0 3 6.5C3 10.5 8 15 8 15z" />
            <circle cx="8" cy="6.5" r="1.8" />
          </svg>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLink)}`} target="_blank" rel="noreferrer">
            {event.location}
          </a>
        </p>
      )}
    </article>
  )
}

function ScheduleBlock({ dealId, schedule, events }: { dealId: string; schedule: Schedule; events: Record<string, EventDetail | null> }) {
  const described = schedule.events.filter((e) => e.hasDescription)
  const plain = schedule.events.filter((e) => !e.hasDescription)
  const loaded = described.map((e) => events[eventKey(dealId, schedule.id, e.id)])
  // The schedule's own description comes with each of its events.
  const note = loaded.find((e) => e?.schedule?.descriptionHtml)?.schedule?.descriptionHtml

  return (
    <section className={described.length ? 'proposal-schedule has-events' : 'proposal-schedule'}>
      <header className="proposal-schedule-head">
        {schedule.date && <p className="eyebrow">{formatShortDate(schedule.date)}</p>}
        <h2>{schedule.name}</h2>
      </header>
      {note && <div className="rich schedule-note proposal-note" dangerouslySetInnerHTML={{ __html: sanitize(note) }} />}
      {described.map((e, i) =>
        loaded[i] ? (
          <EventBlock key={e.id} event={loaded[i]!} />
        ) : (
          <article key={e.id} className="proposal-event">
            <h3 className="proposal-event-name">{e.name}</h3>
            {loaded[i] === undefined ? <Loading /> : <p className="muted">This description could not be loaded.</p>}
          </article>
        ),
      )}
      {plain.length > 0 && (
        <ul className="proposal-plain">
          {plain.map((e) => (
            <li key={e.id}>{e.name}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Everything about the proposal on one page, laid out so the browser's "Save as PDF" gives clean A4 pages.
export function ProposalPage() {
  const { dealId = '' } = useParams()
  const { data, error } = useApi((t) => api.getDeal(t, dealId), [dealId], { cacheKey: `deal:${dealId}` })
  const { data: costingData, error: costingError } = useApi((t) => api.getCosting(t, dealId), [dealId], { cacheKey: `costing:${dealId}` })
  const deal = data?.deal
  const costing = costingData?.costing
  const events = useProgrammeEvents(deal)
  useTrackView(dealId)
  const [printing, setPrinting] = useState(false)

  const expected = deal ? deal.schedules.reduce((n, s) => n + s.events.filter((e) => e.hasDescription).length, 0) : 0
  const done = Object.keys(events).length
  const ready = !!deal && (!!costing || !!costingError) && done >= expected

  // The PDF file name comes from the page title.
  useEffect(() => {
    if (!deal) return
    const before = document.title
    document.title = `${deal.title} – Forte Europe Proposal`
    return () => {
      document.title = before
    }
  }, [deal])

  async function print() {
    setPrinting(true)
    try {
      await imagesReady(document)
      window.print()
    } finally {
      setPrinting(false)
    }
  }

  return (
    <>
      <Header dealId={dealId} />
      <main className="container page proposal">
        <div className="proposal-toolbar no-print">
          <Link className="back" to={`/deals/${dealId}`}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back to programme
          </Link>
          {deal && (
            <button className="btn btn-primary" onClick={print} disabled={!ready || printing}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 8V2h10v6M5 15H3V8h14v7h-2M5 12h10v6H5z" />
              </svg>
              {!ready ? `Preparing… ${Math.min(done, expected)}/${expected}` : printing ? 'Loading photos…' : 'Print Proposal'}
            </button>
          )}
        </div>

        {error && <ErrorMessage message={error} />}
        {!deal && !error && <Loading label="Preparing your proposal… this can take a few seconds" />}
        {deal && (
          <>
            <section className="proposal-cover">
              <div className="hero">
                <p className="eyebrow">Full proposal</p>
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
              </div>
              {deal.managers.length > 0 && (
                <>
                  <h2 className="section-label proposal-label">
                    {deal.managers.length > 1 ? 'Your Forte Europe contacts' : 'Your Forte Europe contact'}
                  </h2>
                  <div className="proposal-managers">
                    {deal.managers.map((m) => (
                      <ManagerCard key={m.id} manager={m} />
                    ))}
                  </div>
                </>
              )}
            </section>

            <h2 className="section-label proposal-label proposal-programme-label">Programme</h2>
            {deal.schedules.map((s) => (
              <ScheduleBlock key={s.id} dealId={dealId} schedule={s} events={events} />
            ))}

            <section className="proposal-costing">
              <h2 className="proposal-section-title">Costing</h2>
              {costingError && <ErrorMessage message={costingError} />}
              {!costing && !costingError && <Loading />}
              {costing && (
                <>
                  {costing.showPrices && (
                    <p className="muted">All prices in EUR, {costing.vatIncluded ? 'VAT included' : 'excluding VAT'}.</p>
                  )}
                  <CostingTables costing={costing} />
                  <CostingDownloads costing={costing} />
                </>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}
