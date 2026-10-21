// Dates and numbers follow the interface language (set by I18nProvider).
let locale = 'en-GB'
const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>()
function fmt<F extends Intl.DateTimeFormat | Intl.NumberFormat>(name: string, make: (l: string) => F): F {
  const key = `${locale}:${name}`
  if (!cache.has(key)) cache.set(key, make(locale))
  return cache.get(key) as F
}
export function setFormatLocale(l: string) {
  locale = l
}
export const formatLocale = () => locale

const day = () => fmt('day', (l) => new Intl.DateTimeFormat(l, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
const short = () => fmt('short', (l) => new Intl.DateTimeFormat(l, { day: 'numeric', month: 'short' }))
const year = () => fmt('year', (l) => new Intl.DateTimeFormat(l, { day: 'numeric', month: 'short', year: 'numeric' }))

const parse = (iso: string) => new Date(`${iso}T12:00:00`)

export const formatLongDate = (iso: string) => day().format(parse(iso))
export const formatShortDate = (iso: string) => short().format(parse(iso))

export function formatRange(start?: string, end?: string) {
  if (!start) return ''
  if (!end || end === start) return year().format(parse(start))
  return `${short().format(parse(start))} – ${year().format(parse(end))}`
}

export const formatMoney = (value: number) =>
  fmt('money', (l) => new Intl.NumberFormat(l, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })).format(value)
export const formatQty = (value: number) => fmt('qty', (l) => new Intl.NumberFormat(l, { maximumFractionDigits: 2 })).format(value)
// Created date in the staff deal list, e.g. "Tue, 22 Sept 2026".
export const formatCreated = (iso: string) =>
  fmt('created', (l) => new Intl.DateTimeFormat(l, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })).format(new Date(iso))
