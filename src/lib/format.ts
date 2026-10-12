const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const yearFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const parse = (iso: string) => new Date(`${iso}T12:00:00`)

export const formatLongDate = (iso: string) => dayFmt.format(parse(iso))
export const formatShortDate = (iso: string) => shortFmt.format(parse(iso))

export function formatRange(start?: string, end?: string) {
  if (!start) return ''
  if (!end || end === start) return yearFmt.format(parse(start))
  return `${shortFmt.format(parse(start))} – ${yearFmt.format(parse(end))}`
}

const moneyFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
const qtyFmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

export const formatMoney = (value: number) => moneyFmt.format(value)
export const formatQty = (value: number) => qtyFmt.format(value)
