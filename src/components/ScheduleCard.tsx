import { Link } from 'react-router-dom'
import type { Schedule } from '../api/types'
import { formatShortDate } from '../lib/format'

export function ScheduleCard({ dealId, schedule }: { dealId: string; schedule: Schedule }) {
  return (
    <li className="schedule">
      <div className="schedule-head">
        {schedule.date && <span className="schedule-date">{formatShortDate(schedule.date)}</span>}
        <h3 className="schedule-name">{schedule.name}</h3>
      </div>
      {schedule.events.length > 0 && (
        <ul className="events">
          {schedule.events.map((e) => (
            <li key={e.id}>
              {e.hasDescription ? (
                <Link className="event is-link" to={`/deals/${dealId}/events/${e.id}?schedule=${schedule.id}`}>
                  <span>{e.name}</span>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
                </Link>
              ) : (
                <span className="event">{e.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
