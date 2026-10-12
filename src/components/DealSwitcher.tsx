import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'
import { formatRange } from '../lib/format'

export function DealSwitcher({ currentId }: { currentId: string }) {
  const { data } = useApi((t) => api.listDeals(t), [])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const deals = data?.deals ?? []
  if (deals.length < 2) return null

  return (
    <div className="switcher" ref={ref}>
      <button className="btn-ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        My deals <span className="badge">{deals.length}</span>
      </button>
      {open && (
        <ul className="switcher-menu" role="menu">
          {deals.map((d) => (
            <li key={d.id}>
              <button
                role="menuitem"
                className={d.id === currentId ? 'is-current' : undefined}
                onClick={() => {
                  setOpen(false)
                  navigate(`/deals/${d.id}`)
                }}
              >
                <span className="switcher-title">{d.title}</span>
                <span className="switcher-meta">
                  {[d.destination, formatRange(d.startDate, d.endDate)].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
