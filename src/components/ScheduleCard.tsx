import { Link, useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import type { Schedule } from '../api/types'
import { formatShortDate } from '../lib/format'

export const eventPath = (dealId: string, scheduleId: string, eventId: string) =>
  `/deals/${dealId}/events/${eventId}?schedule=${scheduleId}`

// Clicking anywhere on a card opens its first event with a description; links inside still open their own event.
export function useOpenFirstEvent(dealId: string, schedule: Schedule) {
  const navigate = useNavigate()
  const first = schedule.events.find((e) => e.hasDescription)
  if (!first) return undefined
  return (e: MouseEvent) => {
    if ((e.target as Element).closest('a')) return
    navigate(eventPath(dealId, schedule.id, first.id))
  }
}

export function ScheduleCard({ dealId, schedule }: { dealId: string; schedule: Schedule }) {
  const open = useOpenFirstEvent(dealId, schedule)
  return (
    <li className={open ? 'schedule is-clickable' : 'schedule'} onClick={open}>
      <div className="schedule-head">
        {schedule.date && <span className="schedule-date">{formatShortDate(schedule.date)}</span>}
        <h3 className="schedule-name">{schedule.name}</h3>
      </div>
      {schedule.events.length > 0 && (
        <ul className="events">
          {schedule.events.map((e) => (
            <li key={e.id}>
              {e.hasDescription ? (
                <Link className="event is-link" to={eventPath(dealId, schedule.id, e.id)}>
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
