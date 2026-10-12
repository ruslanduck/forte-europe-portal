import { Link } from 'react-router-dom'
import type { Schedule } from '../api/types'

// Left-hand programme of the event page: every schedule of the deal with its events.
export function EventNav({ dealId, schedules, currentEventId, currentScheduleId }: {
  dealId: string
  schedules: Schedule[]
  currentEventId: string
  currentScheduleId?: string
}) {
  const withEvents = schedules.filter((s) => s.events.length > 0)
  return (
    <nav className="event-nav" aria-label="Programme">
      <h2 className="section-label">Programme</h2>
      <ol>
        {withEvents.map((s) => (
          <li key={s.id} className={s.id === currentScheduleId ? 'is-current' : undefined}>
            <span className="event-nav-schedule">{s.name}</span>
            <ul>
              {s.events.map((e) => {
                const current = e.id === currentEventId && s.id === currentScheduleId
                return (
                  <li key={e.id}>
                    {e.hasDescription && !current ? (
                      <Link to={`/deals/${dealId}/events/${e.id}?schedule=${s.id}`}>{e.name}</Link>
                    ) : (
                      <span className={current ? 'is-active' : 'is-plain'} aria-current={current ? 'page' : undefined}>
                        {e.name}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  )
}
