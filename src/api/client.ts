import type { Deal, DealSummary, EventDetail, Session } from './types'
import { mockApi } from './mock'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

// Every request goes to one Make webhook; the `action` field selects the route.
async function call<T>(action: string, payload: Record<string, unknown>, token?: string): Promise<T> {
  if (!API_URL) return mockApi(action, payload, token) as Promise<T>

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.error) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status)
  }
  return body as T
}

export const api = {
  login: (email: string, password: string) => call<Session>('auth.login', { email, password }),
  listDeals: (token: string) => call<{ deals: DealSummary[] }>('deals.list', {}, token),
  getDeal: (token: string, dealId: string) => call<{ deal: Deal }>('deals.get', { dealId }, token),
  getEvent: (token: string, dealId: string, eventId: string, scheduleId?: string) =>
    call<{ event: EventDetail }>('events.get', { dealId, eventId, scheduleId }, token),
}
