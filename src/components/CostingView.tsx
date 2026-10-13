import { useState } from 'react'
import type { Costing, CostSection } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { downloadCostingExcel } from '../lib/costingExcel'
import { formatMoney, formatQty } from '../lib/format'

function Section({ section, showPrices, showVat }: { section: CostSection; showPrices: boolean; showVat: boolean }) {
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
            {showPrices && showVat && <th scope="col" className="num">VAT</th>}
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
              {showPrices && showVat && <td className="num" data-label="VAT">{r.vatRate != null ? `${r.vatRate}%` : '—'}</td>}
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

// Schedule tables, grand total and the cancelled-items note; shared by the Costing and Full proposal pages.
export function CostingTables({ costing }: { costing: Costing }) {
  const hasCancelled = costing.sections.some((s) => s.cancelled)
  return (
    <>
      {costing.sections.length === 0 ? (
        <p className="muted cost-empty">No costing has been prepared for this proposal yet.</p>
      ) : (
        <div className="cost-list">
          {costing.sections.map((s) => (
            <Section key={s.id} section={s} showPrices={costing.showPrices} showVat={costing.vatIncluded} />
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
  )
}

// Excel downloads: the client version for everyone, the full internal one for Forte Europe staff.
export function CostingDownloads({ costing }: { costing: Costing }) {
  const { session } = useAuth()
  const isAdmin = session?.contact.role === 'admin'
  const [busy, setBusy] = useState<'client' | 'admin' | null>(null)

  async function download(variant: 'client' | 'admin') {
    setBusy(variant)
    try {
      await downloadCostingExcel(costing, variant)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="cost-downloads no-print">
      <button className="btn btn-primary" onClick={() => download('client')} disabled={busy !== null}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10M6 9l4 4 4-4M4 16h12" /></svg>
        {busy === 'client' ? 'Preparing…' : 'Download Excel'}
      </button>
      {isAdmin && (
        <button className="btn btn-outline" onClick={() => download('admin')} disabled={busy !== null}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10M6 9l4 4 4-4M4 16h12" /></svg>
          {busy === 'admin' ? 'Preparing…' : 'Download internal Excel (all columns)'}
        </button>
      )}
    </div>
  )
}
