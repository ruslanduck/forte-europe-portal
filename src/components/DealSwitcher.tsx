import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useApi } from '../lib/useApi'
import { formatCreated } from '../lib/format'
import { useI18n } from '../i18n'

const PAGE_SIZE = 10

const created = (iso?: string) => (iso ? formatCreated(iso) : '—')

// "My Deals": the signed-in contact's deals (newest first) in a paged dialog.
// Staff see every deal in the system as a table with the Teamo id and creation date, plus search.
export function DealSwitcher({ currentId }: { currentId: string }) {
  const { session } = useAuth()
  const isAdmin = session?.contact.role === 'admin'
  const { t } = useI18n()
  const { data } = useApi((t) => api.listDeals(t), [], { cacheKey: 'deals' })
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const deals = useMemo(() => data?.deals ?? [], [data])
  // Search runs over the list already loaded, so typing never calls the server.
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return deals
    return deals.filter((d) => d.title.toLowerCase().includes(q) || (d.code ?? '').toLowerCase().includes(q))
  }, [deals, query])
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))

  useEffect(() => {
    if (!open) return
    // Open on the page that holds the current deal.
    const i = deals.findIndex((d) => d.id === currentId)
    setQuery('')
    setPage(i >= 0 ? Math.floor(i / PAGE_SIZE) : 0)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, currentId, deals])

  if (deals.length === 0) return null

  const go = (id: string) => {
    setOpen(false)
    navigate(`/deals/${id}`)
  }
  const visible = shown.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        {isAdmin ? t('deals.all') : t('deals.my')} <span className="badge">{deals.length}</span>
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className={isAdmin ? 'modal modal-wide' : 'modal'} role="dialog" aria-modal="true" aria-labelledby="my-deals-title" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <h2 id="my-deals-title">{isAdmin ? t('deals.all') : t('deals.my')}</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label={t('close')}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </header>

            {isAdmin && (
              <div className="deal-search">
                <input
                  type="search"
                  placeholder={t('deals.search')}
                  value={query}
                  autoFocus
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(0)
                  }}
                />
              </div>
            )}

            {isAdmin ? (
              <div className="deal-table-wrap">
                <table className="deal-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('deals.name')}</th>
                      <th scope="col">{t('deals.id')}</th>
                      <th scope="col">{t('deals.created')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((d) => (
                      <tr key={d.id} className={d.id === currentId ? 'is-current' : undefined}>
                        <td>
                          <button aria-current={d.id === currentId ? 'true' : undefined}>
                            {d.title}
                          </button>
                        </td>
                        <td className="deal-code">{d.code ?? '—'}</td>
                        <td className="deal-created">{created(d.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visible.length === 0 && <p className="muted deal-empty">{t('deals.noMatch', { query })}</p>}
              </div>
            ) : (
              <ul className="deal-list">
                {visible.map((d) => (
                  <li key={d.id}>
                    <button
                      className={d.id === currentId ? 'is-current' : undefined}
                      aria-current={d.id === currentId ? 'true' : undefined}
                      onClick={() => go(d.id)}
                    >
                      {d.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {pages > 1 && (
              <nav className="pager" aria-label="Pages">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 0} aria-label={t('pager.prev')}>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
                </button>
                <span>{page + 1} / {pages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= pages - 1} aria-label={t('pager.next')}>
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
