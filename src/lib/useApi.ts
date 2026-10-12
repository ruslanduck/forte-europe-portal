import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

interface State<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Runs an authenticated API call and logs out on 401.
export function useApi<T>(fn: (token: string) => Promise<T>, deps: unknown[]): State<T> {
  const { session, logout } = useAuth()
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true })

  useEffect(() => {
    if (!session) return
    let cancelled = false
    setState({ data: null, error: null, loading: true })
    fn(session.token)
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((err: Error & { status?: number }) => {
        if (cancelled) return
        if (err.status === 401) logout()
        else setState({ data: null, error: err.message, loading: false })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, ...deps])

  return state
}
