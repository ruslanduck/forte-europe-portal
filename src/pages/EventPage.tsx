import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { sanitize, splitCover } from '../lib/html'
import { Header } from '../components/Header'
import { ErrorMessage, Loading } from '../components/Status'

// Map is shown only when the event has coordinates or an address.
function mapSrc(event: { location?: string; lat?: number; lng?: number }) {
  const q = event.lat != null && event.lng != null ? `${event.lat},${event.lng}` : event.location
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed` : null
}

export function EventPage() {
  const { dealId = '', eventId = '' } = useParams()
  const [params] = useSearchParams()
  const scheduleId = params.get('schedule') ?? undefined
  const { data, error } = useApi((t) => api.getEvent(t, dealId, eventId, scheduleId), [dealId, eventId, scheduleId])
  const event = data?.event

  const content = useMemo(() => (event ? splitCover(event.descriptionHtml) : null), [event])
  const map = event && mapSrc(event)

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
        {!event && !error && <Loading />}
        {event && content && (
          <article className="event-page">
            <header className={content.cover ? 'event-hero has-cover' : 'event-hero'}>
              {content.cover && <img src={content.cover} alt="" />}
              <div className="event-hero-text">
                {event.schedule && <p className="eyebrow">{event.schedule.name}</p>}
                <h1>{event.name}</h1>
                {event.location && <p className="event-location">{event.location}</p>}
              </div>
            </header>

            <div className="event-body">
              <div className="rich" dangerouslySetInnerHTML={{ __html: content.body }} />

              {event.schedule?.descriptionHtml && (
                <section className="schedule-note">
                  <h2 className="section-label">About this part of the programme</h2>
                  <div className="rich" dangerouslySetInnerHTML={{ __html: sanitize(event.schedule.descriptionHtml) }} />
                </section>
              )}

              {map && (
                <section className="event-map">
                  <h2 className="section-label">Location</h2>
                  <iframe title={`Map: ${event.name}`} src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </section>
              )}
            </div>
          </article>
        )}
      </main>
    </>
  )
}
