// Shapes returned by the Make webhook. Keep in sync with docs/API_CONTRACT.md.

export interface Manager {
  id: string
  name: string
  role?: string
  phone?: string
  phoneType?: string
  email?: string
  photoUrl?: string
}

export interface DealSummary {
  id: string
  title: string
  startDate?: string // ISO yyyy-mm-dd
  endDate?: string
  destination?: string
  pax?: number
}

export interface EventLink {
  id: string
  name: string
  hasDescription: boolean
}

export interface Schedule {
  id: string
  name: string
  date?: string
  hasDescription: boolean
  events: EventLink[]
}

export interface DealSettings {
  showVat: boolean
  showGrandTotal: boolean
  showSubtotals: boolean
  hidePrices: boolean
}

export interface Deal extends DealSummary {
  preparedFor?: string
  managers: Manager[]
  schedules: Schedule[]
  settings: DealSettings
}

export interface EventDetail {
  id: string
  name: string
  descriptionHtml: string
  location?: string
  lat?: number
  lng?: number
  schedule?: {
    id: string
    name: string
    descriptionHtml?: string
  }
}

export interface Session {
  token: string
  contact: { id: string; name: string; email: string }
}
