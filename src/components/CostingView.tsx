import { useState } from 'react'
import type { Costing, CostSection } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { downloadCostingExcel } from '../lib/costingExcel'
import { formatMoney, formatQty } from '../lib/format'
import { useI18n } from '../i18n'

function Section({ section, showPrices, showVat }: { section: CostSection; showPrices: boolean; showVat: boolean }) {
  const { t } = useI18n()
  return (
    <section className={section.cancelled ? 'cost-card is-cancelled' : 'cost-card'}>
      <header className="cost-card-head">
        <h2>{section.name}</h2>
        {section.cancelled && <span className="cost-badge">{t('costing.cancelled')}</span>}
      </header>

      <table className={showPrices ? 'cost-table' : 'cost-table no-prices'}>
        <thead>
          <tr>
            <th scope="col">{t('costing.item')}</th>
            <th scope="col" className="num">{t('costing.qty')}</th>
            <th scope="col">{t('costing.unit')}</th>
            {showPrices && <th scope="col" className="num">{t('costing.unitPrice')}</th>}
            {showPrices && showVat && <th scope="col" className="num">{t('costing.vat')}</th>}
            {showPrices && <th scope="col" className="num">{t('costing.total')}</th>}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((r) => (
            <tr key={r.id}>
              <td className="cost-item">{r.name}</td>
              <td className="num" data-label={t('costing.qty')}>{r.qty != null ? formatQty(r.qty) : '—'}</td>
              <td className="cost-unit" data-label={t('costing.unit')}>{r.unit ?? '—'}</td>
              {showPrices && <td className="num" data-label={t('costing.unitPrice')}>{formatMoney(r.unitPrice ?? 0)}</td>}
              {showPrices && showVat && <td className="num" data-label={t('costing.vat')}>{r.vatRate != null ? `${r.vatRate}%` : '—'}</td>}
              {showPrices && <td className="num cost-total" data-label={t('costing.total')}>{formatMoney(r.total ?? 0)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {section.subtotal != null && (
        <footer className="cost-subtotal">
          <span>{t('costing.subtotal')}</span>
          <strong>{formatMoney(section.subtotal)}</strong>
        </footer>
      )}
    </section>
  )
}

// Schedule tables, grand total and the cancelled-items note; shared by the Costing and Full proposal pages.
export function CostingTables({ costing }: { costing: Costing }) {
  const hasCancelled = costing.sections.some((s) => s.cancelled)
  const { t } = useI18n()
  return (
    <>
      {costing.sections.length === 0 ? (
        <p className="muted cost-empty">{t('costing.empty')}</p>
      ) : (
        <div className="cost-list">
          {costing.sections.map((s) => (
            <Section key={s.id} section={s} showPrices={costing.showPrices} showVat={costing.vatIncluded} />
          ))}
        </div>
      )}

      {costing.grandTotal != null && (
        <div className="cost-grand">
          <span>{costing.vatIncluded ? t('costing.grandIncl') : t('costing.grandExcl')}</span>
          <strong>{formatMoney(costing.grandTotal)}</strong>
        </div>
      )}
      {hasCancelled && <p className="muted cost-footnote">{t('costing.cancelledNote')}</p>}
    </>
  )
}

// Excel downloads: the client version for everyone, the full internal one for Forte Europe staff.
export function CostingDownloads({ costing }: { costing: Costing }) {
  const { session } = useAuth()
  const isAdmin = session?.contact.role === 'admin'
  const [busy, setBusy] = useState<'client' | 'admin' | null>(null)
  const { t } = useI18n()

  async function download(variant: 'client' | 'admin') {
    setBusy(variant)
    try {
      await downloadCostingExcel(costing, variant, t)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="cost-downloads no-print">
      <button className="btn btn-primary" onClick={() => download('client')} disabled={busy !== null}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10M6 9l4 4 4-4M4 16h12" /></svg>
        {busy === 'client' ? t('costing.preparing') : t('costing.download')}
      </button>
      {isAdmin && (
        <button className="btn btn-outline" onClick={() => download('admin')} disabled={busy !== null}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10M6 9l4 4 4-4M4 16h12" /></svg>
          {busy === 'admin' ? t('costing.preparing') : t('costing.downloadInternal')}
        </button>
      )}
    </div>
  )
}
