import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { sanitize, splitGallery } from '../lib/html'
import { Header } from '../components/Header'
import { EventNav } from '../components/EventNav'
import { ErrorMessage, Loading } from '../components/Status'

// Map is shown only when the event has coordinates or an address.
function mapSrc(event: { location?: string; lat?: number; lng?: number }) {
  const q = event.lat != null && event.lng != null ? `${event.lat},${event.lng}` : event.location
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed` : null
}

function BackLink({ dealId }: { dealId: string }) {
  return (
    <Link className="back" to={`/deals/${dealId}`}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 3L5 8l5 5" />
      </svg>
      Back to programme
    </Link>
  )
}

export function EventPage() {
  const { dealId = '', eventId = '' } = useParams()
  const [params] = useSearchParams()
  const scheduleId = params.get('schedule') ?? undefined
  const { data, error } = useApi((t) => api.getEvent(t, dealId, eventId, scheduleId), [dealId, eventId, scheduleId], {
    cacheKey: `event:${dealId}:${scheduleId}:${eventId}`,
  })
  // The programme on the left reuses the deal loaded by the home page when it is cached.
  const { data: dealData } = useApi((t) => api.getDeal(t, dealId), [dealId], { cacheKey: `deal:${dealId}`, revalidate: false })
  const event = data?.event

  const content = useMemo(() => (event ? splitGallery(event.descriptionHtml) : null), [event])
  const map = event && mapSrc(event)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [eventId, scheduleId])

  return (
    <>
      <Header dealId={dealId} />
      <main className="container page">
        <BackLink dealId={dealId} />
        <div className="event-layout">
          <aside className="event-aside">
            {dealData?.deal ? (
              <EventNav dealId={dealId} schedules={dealData.deal.schedules} currentEventId={eventId} currentScheduleId={scheduleId} />
            ) : (
              <div className="event-nav event-nav-loading" aria-hidden="true" />
            )}
          </aside>

          <div className="event-main">
            {error && <ErrorMessage message={error} />}
            {!event && !error && <Loading />}
            {event && content && (
              <article className="event-page">
                <header className="event-head">
                  {event.schedule && <p className="eyebrow">{event.schedule.name}</p>}
                  <h1>{event.name}</h1>
                </header>

                {content.gallery.length > 0 && (
                  <div className={`event-gallery count-${Math.min(content.gallery.length, 4)}`}>
                    {content.gallery.map((src, i) => (
                      <img key={i} src={src} alt="" loading={i < 2 ? 'eager' : 'lazy'} />
                    ))}
                  </div>
                )}

                {content.body.trim() && (
                  <section className="event-card rich" dangerouslySetInnerHTML={{ __html: content.body }} />
                )}

                {event.schedule?.descriptionHtml && (
                  <section className="schedule-note">
                    <h2 className="section-label">About this part of the programme</h2>
                    <div className="rich" dangerouslySetInnerHTML={{ __html: sanitize(event.schedule.descriptionHtml) }} />
                  </section>
                )}

                {map && (
                  <section className="event-map">
                    <iframe title={`Map: ${event.name}`} src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    <p className="event-location">
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M8 15s5-4.5 5-8.5A5 5 0 0 0 3 6.5C3 10.5 8 15 8 15z" />
                        <circle cx="8" cy="6.5" r="1.8" />
                      </svg>
                      {event.location}
                    </p>
                  </section>
                )}

                <BackLink dealId={dealId} />
              </article>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
