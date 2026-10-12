// Local stand-in for the Make webhook so the portal runs without a backend.
// Login: demo@forteeurope.test / demo
import type { Deal, EventDetail } from './types'

const TEAMO_IMG = 'https://api.teamo360.com/api/uploads/serve/b20b7b97-49eb-484d-ba7c-36a99d0eca16/images'

const lead = {
  id: 'm1',
  name: 'Maria Example',
  role: 'Managing Director',
  phone: '+43 660 000 0000',
  phoneType: 'Mobile',
  email: 'maria@example.com',
}

const deals: Deal[] = [
  {
    id: 'deal-prague',
    title: 'Offer 100001 – Demo Group Prague',
    preparedFor: 'Demo Travel Agency',
    startDate: '2026-10-28',
    endDate: '2026-10-31',
    destination: 'Prague',
    pax: 45,
    managers: [lead],
    settings: { showVat: true, showGrandTotal: true, showSubtotals: true, hidePrices: false },
    schedules: [
      { id: 's-overview', name: 'Overview', hasDescription: false, events: [] },
      { id: 's-transfers', name: 'Transfers', hasDescription: false, events: [{ id: 'e-bus', name: 'Bus Transfers Prague', hasDescription: false }] },
      { id: 's-kampa', name: '29/30 Oct Altany Kampa', hasDescription: false, events: [{ id: 'e-kampa', name: 'Altany Kampa', hasDescription: true }] },
      { id: 's-fuze', name: '29/30 Oct Fuze', hasDescription: false, events: [{ id: 'e-fuze', name: 'Fuze Prague', hasDescription: true }] },
      { id: 's-mecenase', name: '28/29/30 Oct 2026 – U Mecenase – only small buses max 20 seats', hasDescription: true, events: [{ id: 'e-mecenase', name: 'U Mecenase', hasDescription: true }] },
      { id: 's-bastion', name: '28/29/30 Oct 2026 – Bastion – only small buses max 20 seats', hasDescription: false, events: [{ id: 'e-bastion', name: 'Bastion Restaurant Prague (all prices include 10% restaurant service charge)', hasDescription: true }] },
      { id: 's-dinners', name: '29 Oct – Dinner & Brewery', hasDescription: false, events: [
        { id: 'e-fleku', name: 'U Fleku', hasDescription: true },
        { id: 'e-obecni', name: 'Municipal House Pilsner Cellar – Obecni Dum', hasDescription: true },
      ] },
    ],
  },
  {
    id: 'deal-vienna',
    title: '100002 Demo Group Vienna',
    preparedFor: 'Demo Travel Agency',
    startDate: '2026-11-07',
    endDate: '2026-11-11',
    destination: 'Vienna',
    pax: 12,
    managers: [lead, { id: 'm2', name: 'Anna Sample', role: 'Event Assistant', email: 'anna@example.com', phone: '+43 1 000 0000', phoneType: 'Office' }],
    settings: { showVat: false, showGrandTotal: true, showSubtotals: false, hidePrices: false },
    schedules: [
      { id: 's-auersperg', name: 'Day 1 – Welcome reception', date: '2026-11-07', hasDescription: true, events: [{ id: 'e-auersperg', name: 'Auersperg Palace', hasDescription: true }] },
      { id: 's-riding', name: 'Day 2 – Imperial Riding School', date: '2026-11-08', hasDescription: false, events: [
        { id: 'e-riding', name: 'Imperial Riding School', hasDescription: false },
        { id: 'e-transfer', name: 'Transfers', hasDescription: false },
      ] },
    ],
  },
]

const auerspergHtml = `<img src="${TEAMO_IMG}/5512dc37-f064-4f51-a7b6-4c0e68955108.png"><p>Palais Auersperg is one of Vienna's most elegant Baroque venues, offering a prestigious setting for corporate conferences, executive meetings, product launches, gala dinners and receptions. Located just minutes from the historic city centre, the palace combines over 300 years of history with modern event infrastructure.</p><h3>Highlights</h3><ul><li><strong>1,100 m²</strong> of flexible event space with natural daylight</li><li>Exclusive <strong>5,000 m² private palace garden</strong></li><li>Modern audiovisual technology</li></ul><p>With an exceptional central location, Palais Auersperg is one of Vienna's most sought-after venues for international corporate events.</p><img src="${TEAMO_IMG}/4c5a39cf-270a-438c-aadd-54e4347b0a9d.jpg">`

const genericHtml = (name: string) =>
  `<p><strong>${name}</strong> is one of our hand-picked venues. This placeholder text stands in for the description that Make pulls from the Inventory record in Teamo.</p><h3>What to expect</h3><ul><li>Private area reserved for the group</li><li>Set menu with local specialities</li><li>Drinks package on request</li></ul>`

const locations: Record<string, string> = {
  'e-auersperg': 'Palais Auersperg Events, Auerspergstraße, Vienna, Austria',
  'e-kampa': 'Altány Kampa, Prague, Czechia',
  'e-fleku': 'U Fleků, Křemencova 11, Prague, Czechia',
  'e-obecni': 'Obecní dům, náměstí Republiky 5, Prague, Czechia',
}

const scheduleHtml: Record<string, string> = {
  's-mecenase': '<p>Transfers to this restaurant are only possible with <strong>small buses (max 20 seats)</strong> because of the narrow streets of Malá Strana.</p>',
  's-auersperg': '<p>Coaches pick the group up at the hotel at <strong>18:30</strong>. Dress code: cocktail.</p>',
}

type DemoRow = [name: string, qty: number, unit: string, price: number]
const demoCosting: { id: string; name: string; cancelled?: boolean; rows: DemoRow[] }[] = [
  { id: 'c-fb', name: 'Catering F&B', rows: [
    ['Breakfast and light lunch / min. 20 pax billable', 20, 'per person', 74.5],
    ['Equipment fee for the breakfast', 20, 'per person', 7.5],
    ['Service and kitchen staff, time estimated (breakfast/lunch)', 1, 'flat fee', 1258],
    ['Dinner: flying service / buffet as specified, min. 500 billable', 530, 'per person', 55],
    ['Beverage package 2 hours: mineral water, juices, soft drinks, draft beer, wine, coffee & tea', 530, 'per person', 25.5],
  ] },
  { id: 'c-furniture', name: 'Catering Furniture', rows: [
    ['White bar unit, LED-lit, including back panel, 4.5 running metres', 1, 'flat fee', 3132],
    ['Niro bar table, 60 x 120 cm, top: white', 1, 'flat fee', 1318],
    ['Transport', 1, 'flat fee', 6847.5],
  ] },
  { id: 'c-show', name: 'Evening show (cancelled by client)', cancelled: true, rows: [
    ['Live saxophone show, 45 minutes', 1, 'flat fee', 2400],
  ] },
]

const delay =<T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(value), 250))

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status })
}

export async function mockApi(action: string, payload: Record<string, unknown>, token?: string): Promise<unknown> {
  if (action === 'auth.login') {
    if (String(payload.email).toLowerCase() !== 'demo@forteeurope.test' || String(payload.password).toLowerCase() !== 'demo') {
      fail('Wrong login or password', 401)
    }
    return delay({ token: 'mock-token', contact: { id: 'c1', name: 'Demo Client', email: 'demo@forteeurope.test' } })
  }
  if (token !== 'mock-token') fail('Session expired', 401)

  const deal = deals.find((d) => d.id === payload.dealId)
  switch (action) {
    case 'costing.get': {
      if (!deal) fail('Deal not found', 404)
      const { showVat, showSubtotals, showGrandTotal, hidePrices } = deal.settings
      const sections = demoCosting.map((s) => {
        const rows = s.rows.map(([name, qty, unit, price]) => ({
          id: `${s.id}-${name}`, name, qty, unit,
          ...(hidePrices ? {} : { unitPrice: price, total: s.cancelled ? 0 : qty * price, ...(showVat ? { vatRate: 10 } : {}) }),
        }))
        const subtotal = s.cancelled ? 0 : s.rows.reduce((sum, [, qty, , price]) => sum + qty * price, 0)
        return { id: s.id, name: s.name, cancelled: !!s.cancelled, rows, ...(showSubtotals && !hidePrices ? { subtotal } : {}), _sum: subtotal }
      })
      const grandTotal = sections.reduce((sum, s) => sum + s._sum, 0)
      return delay({ costing: {
        dealId: deal.id, title: deal.title, vatIncluded: showVat, showPrices: !hidePrices,
        meta: { code: 'DEMO-1', client: deal.preparedFor, contact: 'Demo Client', startDate: deal.startDate, endDate: deal.endDate, destination: deal.destination },
        sections: sections.map(({ _sum, ...s }) => s),
        ...(showGrandTotal && !hidePrices ? { grandTotal } : {}),
      } })
    }
    case 'deals.list':
      return delay({ deals: deals.map(({ id, title, startDate, endDate, destination, pax }) => ({ id, title, startDate, endDate, destination, pax })) })
    case 'deals.get':
      if (!deal) fail('Deal not found', 404)
      return delay({ deal })
    case 'events.get': {
      if (!deal) fail('Deal not found', 404)
      const schedule = deal.schedules.find((s) => s.id === payload.scheduleId)
      const link = deal.schedules.flatMap((s) => s.events).find((e) => e.id === payload.eventId)
      if (!link?.hasDescription) fail('Event not found', 404)
      const event: EventDetail = {
        id: link.id,
        name: link.name,
        descriptionHtml: link.id === 'e-auersperg' ? auerspergHtml : genericHtml(link.name),
        location: locations[link.id],
        schedule: schedule && { id: schedule.id, name: schedule.name, descriptionHtml: scheduleHtml[schedule.id] },
      }
      return delay({ event })
    }
  }
  fail(`Unknown action ${action}`, 400)
}
