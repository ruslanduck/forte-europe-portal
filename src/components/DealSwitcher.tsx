import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../lib/useApi'

const PAGE_SIZE = 10

// "My Deals": every deal of the signed-in contact (newest first) in a paged dialog.
export function DealSwitcher({ currentId }: { currentId: string }) {
  const { data } = useApi((t) => api.listDeals(t), [], { cacheKey: 'deals' })
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  const deals = data?.deals ?? []
  const pages = Math.max(1, Math.ceil(deals.length / PAGE_SIZE))

  useEffect(() => {
    if (!open) return
    // Open on the page that holds the current deal.
    const i = deals.findIndex((d) => d.id === currentId)
    setPage(i >= 0 ? Math.floor(i / PAGE_SIZE) : 0)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, currentId, deals])

  if (deals.length === 0) return null

  return (
    <>
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        My Deals <span className="badge">{deals.length}</span>
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="my-deals-title" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <h2 id="my-deals-title">My Deals</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </header>
            <ul className="deal-list">
              {deals.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((d) => (
                <li key={d.id}>
                  <button
                    className={d.id === currentId ? 'is-current' : undefined}
                    aria-current={d.id === currentId ? 'true' : undefined}
                    onClick={() => {
                      setOpen(false)
                      navigate(`/deals/${d.id}`)
                    }}
                  >
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav className="pager" aria-label="Pages">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 0} aria-label="Previous page">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
                </button>
                <span>{page + 1} / {pages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= pages - 1} aria-label="Next page">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
                </button>
              </nav>
            )}
          </div>
        </div>
      )}
    </>
  )
}
