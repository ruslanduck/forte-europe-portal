import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { CostSection } from '../api/types'
import { useApi } from '../lib/useApi'
import { formatMoney, formatQty } from '../lib/format'
import { Header } from '../components/Header'
import { ErrorMessage, Loading } from '../components/Status'

function Section({ section, showPrices }: { section: CostSection; showPrices: boolean }) {
  return (
    <section className={section.cancelled ? 'cost-card is-cancelled' : 'cost-card'}>
      <header className="cost-card-head">
        <h2>{section.name}</h2>
        {section.cancelled && <span className="cost-badge">Cancelled · not included in totals</span>}
      </header>

      <table className={showPrices ? 'cost-table' : 'cost-table no-prices'}>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" className="num">Qty</th>
            <th scope="col">Unit</th>
            {showPrices && <th scope="col" className="num">Unit price</th>}
            {showPrices && <th scope="col" className="num">Total</th>}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((r) => (
            <tr key={r.id}>
              <td className="cost-item">{r.name}</td>
              <td className="num" data-label="Qty">{r.qty != null ? formatQty(r.qty) : '—'}</td>
              <td className="cost-unit" data-label="Unit">{r.unit ?? '—'}</td>
              {showPrices && <td className="num" data-label="Unit price">{formatMoney(r.unitPrice ?? 0)}</td>}
              {showPrices && <td className="num cost-total" data-label="Total">{formatMoney(r.total ?? 0)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {section.subtotal != null && (
        <footer className="cost-subtotal">
          <span>Subtotal</span>
          <strong>{formatMoney(section.subtotal)}</strong>
        </footer>
      )}
    </section>
  )
}

export function CostingPage() {
  const { dealId = '' } = useParams()
  const { data, error } = useApi((t) => api.getCosting(t, dealId), [dealId])
  const costing = data?.costing
  const hasCancelled = costing?.sections.some((s) => s.cancelled)

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
        {!costing && !error && <Loading label="Calculating your costing… this can take a few seconds" />}
        {costing && (
          <>
            <section className="hero hero-compact">
              <p className="eyebrow">Costing</p>
              <h1 className="hero-title">{costing.title}</h1>
              {costing.showPrices && (
                <p className="hero-note">All prices in EUR, {costing.vatIncluded ? 'VAT included' : 'excluding VAT'}.</p>
              )}
            </section>

            {costing.sections.length === 0 ? (
              <p className="muted cost-empty">No costing has been prepared for this proposal yet.</p>
            ) : (
              <div className="cost-list">
                {costing.sections.map((s) => (
                  <Section key={s.id} section={s} showPrices={costing.showPrices} />
                ))}
              </div>
            )}

            {costing.grandTotal != null && (
              <div className="cost-grand">
                <span>Grand total{costing.vatIncluded ? ' (VAT included)' : ' (excl. VAT)'}</span>
                <strong>{formatMoney(costing.grandTotal)}</strong>
              </div>
            )}
            {hasCancelled && <p className="muted cost-footnote">Items marked as cancelled are shown for reference and are not included in any totals.</p>}
          </>
        )}
      </main>
    </>
  )
}
