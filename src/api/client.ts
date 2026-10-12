import type { Costing, Deal, DealSummary, EventDetail, Session } from './types'
import { mockApi } from './mock'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

// Every request goes to one Make webhook; the `action` field selects the route.
// Sent as a form post with the token in the body: a "simple" CORS request, so no preflight.
async function call<T>(action: string, payload: Record<string, string | undefined>, token?: string): Promise<T> {
  if (!API_URL) return mockApi(action, payload, token) as Promise<T>

  const form = new URLSearchParams({ action })
  if (token) form.set('token', token)
  for (const [key, value] of Object.entries(payload)) if (value != null) form.set(key, value)

  // Make answers within ~15 s; never leave the page spinning if it does not answer at all.
  let res: Response
  try {
    res = await fetch(API_URL, { method: 'POST', body: form, signal: AbortSignal.timeout(60_000) })
  } catch {
    throw new ApiError('The server is not responding. Please try again in a moment.', 0)
  }
  // A non-JSON reply (e.g. Make's plain "Accepted") means the scenario produced no answer.
  const body = await res.json().catch(() => ({ error: 'Unexpected server response. Please try again.' }))
  if (!res.ok || body.error) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status)
  }
  return body as T
}

export const api = {
  login: (email: string, password: string) => call<Session>('auth.login', { email, password }),
  listDeals: (token: string) => call<{ deals: DealSummary[] }>('deals.list', {}, token),
  getDeal: (token: string, dealId: string) => call<{ deal: Deal }>('deals.get', { dealId }, token),
  getCosting: (token: string, dealId: string) => call<{ costing: Costing }>('costing.get', { dealId }, token),
  getEvent: (token: string, dealId: string, eventId: string, scheduleId?: string) =>
    call<{ event: EventDetail }>('events.get', { dealId, eventId, scheduleId }, token),
}
