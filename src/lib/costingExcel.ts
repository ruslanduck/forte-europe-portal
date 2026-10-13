import type { AdminCostFields, AdminTotals, Costing, CostRow } from '../api/types'

// Excel export of the costing, laid out like the Bubble download: a header block with the
// programme details, then one table per schedule with a subtotal row.
// Totals are live Excel formulas (Qty x unit price, SUM per schedule, grand total), so whoever opens
// the file can change a quantity and see the totals follow. Unit prices are inputs in Teamo, so they stay values.

type Ref = (key: string) => string

interface Column {
  key: string
  header: string
  width: number
  kind: 'qty' | 'text' | 'money' | 'pct'
  value: (row: CostRow) => number | string | undefined
  total?: keyof NonNullable<AdminTotals> | 'client'
  // Row formula, given the address of another column's cell in the same row.
  formula?: (at: Ref) => string
}

const HEADER_FILL = 'FFE5CCF5'
const CANCELLED_FILL = 'FFFDECEC'
const CANCELLED_FONT = 'FFD42D2D'
const GREY = 'FF808080'

function clientColumns(c: Costing): Column[] {
  const cols: Column[] = [
    { key: 'qty', header: 'Qty', width: 8, kind: 'qty', value: (r) => r.qty },
    { key: 'unit', header: 'Unit\nDescription', width: 18, kind: 'text', value: (r) => r.unit },
  ]
  if (c.showPrices) {
    cols.push({ key: 'price', header: c.vatIncluded ? 'Unit Price\n(Incl Tax)\n€' : 'Unit Price\n€', width: 14, kind: 'money', value: (r) => r.unitPrice })
    if (c.vatIncluded) cols.push({ key: 'vat', header: 'VAT %', width: 9, kind: 'pct', value: (r) => r.vatRate })
    cols.push({ key: 'total', header: c.vatIncluded ? 'Total Price\n(Incl Tax)\n€' : 'Total Price\n€', width: 14, kind: 'money',
      value: (r) => r.total, total: 'client', formula: (at) => `${at('qty')}*${at('price')}` })
  }
  cols.push({ key: 'comments', header: 'Comments', width: 24, kind: 'text', value: () => undefined })
  return cols
}

function adminColumns(): Column[] {
  const a = (k: keyof AdminCostFields) => (r: CostRow) => r.admin?.[k]
  // Unit prices are typed (and rounded) by hand in Teamo, so only the derived columns are formulas.
  return [
    { key: 'qty', header: 'Qty', width: 8, kind: 'qty', value: (r) => r.qty },
    { key: 'unit', header: 'Unit\nDescription', width: 18, kind: 'text', value: (r) => r.unit },
    { key: 'ucn', header: 'Unit Cost\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('unitCostNet') },
    { key: 'tcn', header: 'Total Cost\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('totalCostNet'), total: 'totalCostNet',
      formula: (at) => `${at('qty')}*${at('ucn')}` },
    { key: 'cv', header: 'Cost VAT %', width: 9, kind: 'pct', value: a('costVat') },
    { key: 'ucg', header: 'Unit Cost\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('unitCostGross'),
      formula: (at) => `${at('ucn')}*(1+${at('cv')})` },
    { key: 'tcg', header: 'Total Cost\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('totalCostGross'), total: 'totalCostGross',
      formula: (at) => `${at('qty')}*${at('ucg')}` },
    { key: 'mk', header: 'Markup', width: 9, kind: 'pct', value: a('markup') },
    { key: 'upn', header: 'Unit Price\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('unitPriceNet') },
    { key: 'tpn', header: 'Total Price\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('totalPriceNet'), total: 'totalPriceNet',
      formula: (at) => `${at('qty')}*${at('upn')}` },
    { key: 'pv', header: 'Price VAT %', width: 9, kind: 'pct', value: a('priceVat') },
    { key: 'upg', header: 'Unit Price\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('unitPriceGross') },
    { key: 'tpg', header: 'Total Price\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('totalPriceGross'), total: 'totalPriceGross',
      formula: (at) => `${at('qty')}*${at('upg')}` },
    { key: 'profit', header: 'Profit', width: 12, kind: 'money', value: a('profit'), total: 'profit',
      formula: (at) => `${at('tpn')}-${at('tcn')}` },
    { key: 'comments', header: 'Comments', width: 24, kind: 'text', value: () => undefined },
  ]
}

const MONEY = '#,##0.00'
// Whole numbers get a format without decimals, otherwise Excel shows a trailing "10." for "0.##".
function numFmt(kind: Column['kind'], v: unknown) {
  const whole = typeof v !== 'number' || Number.isInteger(Math.round((kind === 'pct' ? v * 100 : v) * 1e6) / 1e6)
  if (kind === 'qty') return whole ? '#,##0' : '#,##0.##'
  if (kind === 'pct') return whole ? '0%' : '0.0#%'
  return kind === 'money' ? MONEY : '@'
}

const fmtDate = (iso?: string) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso)) : ''
const fmtStamp = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)

export async function downloadCostingExcel(costing: Costing, variant: 'client' | 'admin') {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Forte Europe'
  wb.calcProperties.fullCalcOnLoad = true
  const ws = wb.addWorksheet('Costing', { views: [{ showGridLines: false }] })
  const cols = variant === 'admin' ? adminColumns() : clientColumns(costing)
  const last = 2 + cols.length // column B holds the item names

  ws.getColumn(1).width = 3
  ws.getColumn(2).width = 55
  cols.forEach((c, i) => (ws.getColumn(3 + i).width = c.width))
  const letter = (i: number) => ws.getColumn(3 + i).letter
  const letterOf: Record<string, string> = Object.fromEntries(cols.map((c, i) => [c.key, letter(i)]))
  // Item rows of the schedules that count towards the grand total, as [first, last] row numbers.
  const counted: [number, number][] = []

  const m = costing.meta
  const info = (row: number, col: number, text: string, mergeTo?: number) => {
    const cell = ws.getCell(row, col)
    cell.value = text
    cell.font = { color: { argb: GREY } }
    if (mergeTo) ws.mergeCells(row, col, row, mergeTo)
  }
  ws.getCell(2, 2).value = variant === 'admin' ? 'Costing (internal)' : 'Costing'
  ws.getCell(2, 2).font = { size: 16, bold: true, color: { argb: 'FF5C0A96' } }
  info(4, 2, `Downloaded: ${fmtStamp(new Date())}${m.created ? `  |  Created: ${fmtStamp(new Date(m.created))}` : ''}`, last)
  info(6, 2, `Client: ${m.client ?? ''}`)
  info(6, 3, `Program Name: ${costing.title}`, last)
  info(7, 2, `Contact: ${m.contact ?? ''}`)
  info(7, 3, `Program Code: ${m.code ?? ''}`, last)
  info(8, 3, `Program Date: ${fmtDate(m.startDate)} - ${fmtDate(m.endDate)}`, last)
  info(9, 3, `Destination(s): ${m.destination ?? ''}`, last)
  if (variant === 'client' && costing.showPrices) info(10, 3, costing.vatIncluded ? 'Prices include VAT' : 'Prices exclude VAT', last)

  const border = { bottom: { style: 'thin' as const, color: { argb: 'FFD9D2E3' } } }
  let r = 12
  for (const section of costing.sections) {
    const head = ws.getRow(r)
    head.getCell(2).value = section.date ? `${section.name}\n${fmtDate(section.date)}` : section.name
    head.getCell(2).font = { bold: true }
    cols.forEach((c, i) => (head.getCell(3 + i).value = c.header))
    for (let col = 2; col <= last; col++) {
      const cell = head.getCell(col)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: col === 2 ? 'left' : 'center' }
      cell.border = border
    }
    if (section.cancelled) head.getCell(2).value = `${head.getCell(2).value} (cancelled, not included in totals)`
    r++

    const first = r
    for (const item of section.rows) {
      const row = ws.getRow(r)
      row.getCell(2).value = item.name
      const at: Ref = (key) => `${letterOf[key]}${row.number}`
      cols.forEach((c, i) => {
        const cell = row.getCell(3 + i)
        const raw = c.value(item)
        // Percentages come as 10 for 10 %; Excel wants 0.1 with a % format.
        const v = c.kind === 'pct' && typeof raw === 'number' ? raw / 100 : raw
        // The cached result keeps the figure visible in viewers that do not recalculate.
        cell.value = c.formula && !section.cancelled ? { formula: c.formula(at), result: typeof v === 'number' ? v : 0 } : v ?? null
        cell.numFmt = numFmt(c.kind, v)
      })
      for (let col = 2; col <= last; col++) {
        const cell = row.getCell(col)
        cell.alignment = { wrapText: true, vertical: 'top', horizontal: col === 2 ? 'left' : 'center' }
        cell.border = border
        if (section.cancelled) {
          cell.font = { color: { argb: CANCELLED_FONT }, strike: true }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CANCELLED_FILL } }
        }
      }
      r++
    }

    const lastRow = r - 1
    if (!section.cancelled && lastRow >= first) counted.push([first, lastRow])

    // Subtotal row: client totals follow the deal's "Show Subtotals"; staff always get theirs.
    // A cancelled schedule is not charged, so its subtotal stays 0 like on the page.
    const totals = cols.map((c) =>
      c.total === 'client' ? section.subtotal : c.total ? section.adminTotals?.[c.total] ?? 0 : undefined)
    if (totals.some((t) => t != null)) {
      const row = ws.getRow(r)
      totals.forEach((t, i) => {
        if (t == null) return
        const cell = row.getCell(3 + i)
        cell.value = section.cancelled ? 0 : { formula: `SUM(${letter(i)}${first}:${letter(i)}${lastRow})`, result: t }
        cell.numFmt = MONEY
        cell.font = { bold: true }
        cell.alignment = { horizontal: 'center' }
      })
      r++
    }
    r++
  }

  // Grand total row
  const grand = cols.map((c) => (c.total === 'client' ? costing.grandTotal : c.total ? costing.adminTotals?.[c.total] : undefined))
  if (grand.some((t) => t != null)) {
    const row = ws.getRow(r)
    row.getCell(2).value = 'Grand total'
    row.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    for (let col = 2; col <= last; col++) {
      row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5C0A96' } }
    }
    grand.forEach((t, i) => {
      if (t == null) return
      const cell = row.getCell(3 + i)
      const ranges = counted.map(([a, b]) => `${letter(i)}${a}:${letter(i)}${b}`)
      cell.value = ranges.length ? { formula: `SUM(${ranges.join(',')})`, result: t } : 0
      cell.numFmt = MONEY
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { horizontal: 'center' }
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const name = `${costing.title.replace(/[\\/:*?"<>|]+/g, ' ').trim()} - Costing${variant === 'admin' ? ' (internal)' : ''}.xlsx`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
