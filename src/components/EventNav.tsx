import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Schedule } from '../api/types'
import { eventPath, useOpenFirstEvent } from './ScheduleCard'
import { useI18n } from '../i18n'

function ScheduleItem({ dealId, schedule, current, children }: { dealId: string; schedule: Schedule; current: boolean; children: ReactNode }) {
  const open = useOpenFirstEvent(dealId, schedule)
  const cls = [current && 'is-current', open && !current && 'is-clickable'].filter(Boolean).join(' ')
  return (
    <li className={cls || undefined} onClick={current ? undefined : open}>
      <span className="event-nav-schedule">{schedule.name}</span>
      <ul>{children}</ul>
    </li>
  )
}

// Left-hand programme of the event page: every schedule of the deal with its events.
export function EventNav({ dealId, schedules, currentEventId, currentScheduleId }: {
  dealId: string
  schedules: Schedule[]
  currentEventId: string
  currentScheduleId?: string
}) {
  const withEvents = schedules.filter((s) => s.events.length > 0)
  const { t } = useI18n()
  return (
    <nav className="event-nav" aria-label={t('deal.programme')}>
      <h2 className="section-label">{t('deal.programme')}</h2>
      <ol>
        {withEvents.map((s) => (
          <ScheduleItem key={s.id} dealId={dealId} schedule={s} current={s.id === currentScheduleId}>
            {s.events.map((e) => {
              const current = e.id === currentEventId && s.id === currentScheduleId
              return (
                <li key={e.id}>
                  {e.hasDescription && !current ? (
                    <Link to={eventPath(dealId, s.id, e.id)}>{e.name}</Link>
                  ) : (
                    <span className={current ? 'is-active' : 'is-plain'} aria-current={current ? 'page' : undefined}>
                      {e.name}
                    </span>
                  )}
                </li>
              )
            })}
          </ScheduleItem>
        ))}
      </ol>
    </nav>
  )
}
