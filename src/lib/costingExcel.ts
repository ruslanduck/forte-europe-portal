import type { AdminCostFields, AdminTotals, Costing, CostRow } from '../api/types'

// Excel export of the costing, laid out like the Bubble download: a header block with the
// programme details, then one table per schedule with a subtotal row.

interface Column {
  header: string
  width: number
  kind: 'qty' | 'text' | 'money' | 'pct'
  value: (row: CostRow) => number | string | undefined
  total?: keyof NonNullable<AdminTotals> | 'client'
}

const HEADER_FILL = 'FFE5CCF5'
const CANCELLED_FILL = 'FFFDECEC'
const CANCELLED_FONT = 'FFD42D2D'
const GREY = 'FF808080'

function clientColumns(c: Costing): Column[] {
  const cols: Column[] = [
    { header: 'Qty', width: 8, kind: 'qty', value: (r) => r.qty },
    { header: 'Unit\nDescription', width: 18, kind: 'text', value: (r) => r.unit },
  ]
  if (c.showPrices) {
    cols.push({ header: c.vatIncluded ? 'Unit Price\n(Incl Tax)\n€' : 'Unit Price\n€', width: 14, kind: 'money', value: (r) => r.unitPrice })
    if (c.vatIncluded) cols.push({ header: 'VAT %', width: 9, kind: 'pct', value: (r) => r.vatRate })
    cols.push({ header: c.vatIncluded ? 'Total Price\n(Incl Tax)\n€' : 'Total Price\n€', width: 14, kind: 'money', value: (r) => r.total, total: 'client' })
  }
  cols.push({ header: 'Comments', width: 24, kind: 'text', value: () => undefined })
  return cols
}

function adminColumns(): Column[] {
  const a = (k: keyof AdminCostFields) => (r: CostRow) => r.admin?.[k]
  return [
    { header: 'Qty', width: 8, kind: 'qty', value: (r) => r.qty },
    { header: 'Unit\nDescription', width: 18, kind: 'text', value: (r) => r.unit },
    { header: 'Unit Cost\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('unitCostNet') },
    { header: 'Total Cost\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('totalCostNet'), total: 'totalCostNet' },
    { header: 'Cost VAT %', width: 9, kind: 'pct', value: a('costVat') },
    { header: 'Unit Cost\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('unitCostGross') },
    { header: 'Total Cost\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('totalCostGross'), total: 'totalCostGross' },
    { header: 'Markup', width: 9, kind: 'pct', value: a('markup') },
    { header: 'Unit Price\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('unitPriceNet') },
    { header: 'Total Price\n(Excl Tax)\n€', width: 13, kind: 'money', value: a('totalPriceNet'), total: 'totalPriceNet' },
    { header: 'Price VAT %', width: 9, kind: 'pct', value: a('priceVat') },
    { header: 'Unit Price\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('unitPriceGross') },
    { header: 'Total Price\n(Incl Tax)\n€', width: 13, kind: 'money', value: a('totalPriceGross'), total: 'totalPriceGross' },
    { header: 'Profit', width: 12, kind: 'money', value: a('profit'), total: 'profit' },
    { header: 'Comments', width: 24, kind: 'text', value: () => undefined },
  ]
}

const FORMATS = { qty: '#,##0.##', money: '#,##0.00', pct: '0.##"%"', text: '@' }

const fmtDate = (iso?: string) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso)) : ''
const fmtStamp = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)

export async function downloadCostingExcel(costing: Costing, variant: 'client' | 'admin') {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Forte Europe'
  const ws = wb.addWorksheet('Costing', { views: [{ showGridLines: false }] })
  const cols = variant === 'admin' ? adminColumns() : clientColumns(costing)
  const last = 2 + cols.length // column B holds the item names

  ws.getColumn(1).width = 3
  ws.getColumn(2).width = 55
  cols.forEach((c, i) => (ws.getColumn(3 + i).width = c.width))

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

    for (const item of section.rows) {
      const row = ws.getRow(r)
      row.getCell(2).value = item.name
      cols.forEach((c, i) => {
        const cell = row.getCell(3 + i)
        const v = c.value(item)
        cell.value = v ?? null
        cell.numFmt = FORMATS[c.kind]
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

    // Subtotal row: client totals follow the deal's "Show Subtotals"; staff always get theirs.
    const totals = cols.map((c) =>
      c.total === 'client' ? section.subtotal : c.total ? section.adminTotals?.[c.total] ?? 0 : undefined)
    if (totals.some((t) => t != null)) {
      const row = ws.getRow(r)
      totals.forEach((t, i) => {
        if (t == null) return
        const cell = row.getCell(3 + i)
        cell.value = t
        cell.numFmt = FORMATS.money
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
      cell.value = t
      cell.numFmt = FORMATS.money
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
