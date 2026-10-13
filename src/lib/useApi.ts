import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

interface State<T> {
  data: T | null
  error: string | null
  loading: boolean
}

interface Options {
  // Responses are cached per tab under this key, so pages can reuse data another page already loaded.
  cacheKey?: string
  // With a stale cached value: true shows it and refreshes in the background; false trusts the cache.
  revalidate?: boolean
}

// Cached responses younger than this are shown as-is, without asking the server again.
const FRESH_MS = 5 * 60_000

interface Entry {
  at: number
  value: unknown
}

const memory = new Map<string, Entry>()
// Requests in flight, so a page opened while its data is being prefetched waits for that same request.
const inflight = new Map<string, Promise<unknown>>()

function readEntry(key?: string): Entry | null {
  if (!key) return null
  const hit = memory.get(key)
  if (hit) return hit
  try {
    const raw = sessionStorage.getItem(`fe-cache:${key}`)
    if (!raw) return null
    const entry = JSON.parse(raw) as Entry
    if (typeof entry?.at !== 'number') return null
    memory.set(key, entry)
    return entry
  } catch {
    return null
  }
}

function writeCache(key: string, value: unknown) {
  const entry = { at: Date.now(), value }
  memory.set(key, entry)
  try {
    sessionStorage.setItem(`fe-cache:${key}`, JSON.stringify(entry))
  } catch {
    // Storage full or blocked: the in-memory copy is enough.
  }
}

export function clearApiCache() {
  memory.clear()
  inflight.clear()
  try {
    Object.keys(sessionStorage).filter((k) => k.startsWith('fe-cache:')).forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}

function load<T>(key: string | undefined, run: () => Promise<T>): Promise<T> {
  if (!key) return run()
  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>
  const p = run()
    .then((data) => {
      writeCache(key, data)
      return data
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

// Loads a response into the cache ahead of time; does nothing if it is already fresh or loading.
export function prefetch<T>(key: string, run: () => Promise<T>): Promise<T | null> {
  const entry = readEntry(key)
  if (entry && Date.now() - entry.at < FRESH_MS) return Promise.resolve(entry.value as T)
  return load(key, run).catch(() => null)
}

// Runs an authenticated API call and logs out on 401.
export function useApi<T>(fn: (token: string) => Promise<T>, deps: unknown[], options: Options = {}): State<T> {
  const { session, logout } = useAuth()
  const { cacheKey, revalidate = true } = options
  const [state, setState] = useState<State<T>>(() => {
    const cached = (readEntry(cacheKey)?.value as T) ?? null
    return { data: cached, error: null, loading: !cached }
  })

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const entry = readEntry(cacheKey)
    const cached = (entry?.value as T) ?? null
    setState({ data: cached, error: null, loading: !cached })
    if (entry && (!revalidate || Date.now() - entry.at < FRESH_MS)) return

    load(cacheKey, () => fn(session.token))
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((err: Error & { status?: number }) => {
        if (cancelled) return
        if (err.status === 401) logout()
        // Keep showing cached data if only the refresh failed.
        else if (!cached) setState({ data: null, error: err.message, loading: false })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, cacheKey, ...deps])

  return state
}
