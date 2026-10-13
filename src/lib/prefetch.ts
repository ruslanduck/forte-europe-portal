import { useEffect } from 'react'
import { api } from '../api/client'
import type { Deal } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { prefetch } from './useApi'

// Requests at a time while warming up, so the backend is not hit with a whole programme at once.
const CONCURRENCY = 3
const IMAGES_PER_EVENT = 4

export async function pool(tasks: (() => Promise<unknown>)[]) {
  let next = 0
  const worker = async () => {
    while (next < tasks.length) await tasks[next++]()
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker))
}

function preloadImages(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  Array.from(doc.images)
    .slice(0, IMAGES_PER_EVENT)
    .forEach((img) => {
      if (img.src) new Image().src = img.src
    })
}

// Once a deal is open, quietly loads its costing, every event page and their first photos,
// so switching between tabs is instant instead of waiting on the server each time.
export function usePrefetchDeal(dealId: string) {
  const { session } = useAuth()
  const token = session?.token

  useEffect(() => {
    if (!token || !dealId) return
    let stopped = false
    ;(async () => {
      const res = await prefetch(`deal:${dealId}`, () => api.getDeal(token, dealId))
      const deal: Deal | undefined = res?.deal
      if (!deal || stopped) return
      const tasks: (() => Promise<unknown>)[] = [
        () => prefetch(`costing:${dealId}`, () => api.getCosting(token, dealId)),
        () => prefetch('deals', () => api.listDeals(token)),
      ]
      for (const s of deal.schedules)
        for (const e of s.events.filter((x) => x.hasDescription))
          tasks.push(async () => {
            if (stopped) return
            const r = await prefetch(`event:${dealId}:${s.id}:${e.id}`, () => api.getEvent(token, dealId, e.id, s.id))
            if (r?.event?.descriptionHtml && !stopped) preloadImages(r.event.descriptionHtml)
          })
      await pool(tasks)
    })()
    return () => {
      stopped = true
    }
  }, [token, dealId])
}
