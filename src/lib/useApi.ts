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
  // With a cached value: true shows it and refreshes in the background; false trusts the cache.
  revalidate?: boolean
}

const memory = new Map<string, unknown>()

function readCache<T>(key?: string): T | null {
  if (!key) return null
  if (memory.has(key)) return memory.get(key) as T
  try {
    const raw = sessionStorage.getItem(`fe-cache:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeCache(key: string | undefined, value: unknown) {
  if (!key) return
  memory.set(key, value)
  try {
    sessionStorage.setItem(`fe-cache:${key}`, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the in-memory copy is enough.
  }
}

export function clearApiCache() {
  memory.clear()
  try {
    Object.keys(sessionStorage).filter((k) => k.startsWith('fe-cache:')).forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}

// Runs an authenticated API call and logs out on 401.
export function useApi<T>(fn: (token: string) => Promise<T>, deps: unknown[], options: Options = {}): State<T> {
  const { session, logout } = useAuth()
  const { cacheKey, revalidate = true } = options
  const [state, setState] = useState<State<T>>(() => {
    const cached = readCache<T>(cacheKey)
    return { data: cached, error: null, loading: !cached }
  })

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const cached = readCache<T>(cacheKey)
    setState({ data: cached, error: null, loading: !cached })
    if (cached && !revalidate) return

    fn(session.token)
      .then((data) => {
        writeCache(cacheKey, data)
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
