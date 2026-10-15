// Shapes returned by the portal backend. Keep in sync with docs/API_CONTRACT.md.

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
  code?: string // Teamo record id, e.g. DEA-18
  createdAt?: string // ISO timestamp the deal was created in Teamo
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
  contact: { id: string; name: string; email: string; role?: 'client' | 'admin' }
}

export interface CostRow {
  id: string
  name: string
  qty?: number
  unit?: string
  unitPrice?: number // omitted when the deal hides prices
  total?: number
  vatRate?: number // percent, only when the deal shows VAT
  admin?: AdminCostFields // staff only
}

export interface AdminCostFields {
  unitCostNet: number
  totalCostNet: number
  costVat: number
  unitCostGross: number
  totalCostGross: number
  markup: number
  unitPriceNet: number
  totalPriceNet: number
  priceVat: number
  unitPriceGross: number
  totalPriceGross: number
  profit: number
}

export type AdminTotals = Partial<Record<'totalCostNet' | 'totalCostGross' | 'totalPriceNet' | 'totalPriceGross' | 'profit', number>>

export interface CostSection {
  id: string
  name: string
  date?: string
  cancelled: boolean // cancelled schedules stay visible but count as 0
  rows: CostRow[]
  adminTotals?: AdminTotals
  subtotal?: number // only when the deal shows subtotals
}

export interface Costing {
  dealId: string
  title: string
  vatIncluded: boolean
  showPrices: boolean
  sections: CostSection[]
  grandTotal?: number // only when the deal shows the grand total
  adminTotals?: AdminTotals // staff only
  meta: {
    code?: string
    created?: string
    startDate?: string
    endDate?: string
    destination?: string
    contact?: string
    client?: string
  }
}
