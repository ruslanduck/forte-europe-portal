import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Logo } from '../components/Logo'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'

export function LoginPage() {
  const { session, login } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-top">
          <Logo />
          <LanguageSwitcher />
        </div>
        <h1>{t('login.title')}</h1>
        <p className="muted">{t('login.intro')}</p>
        <label>
          {t('login.login')}
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          {t('login.password')}
          <input
            type="password"
            autoComplete="current-password"
            autoCapitalize="characters"
            spellCheck={false}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? t('login.busy') : t('login.submit')}
        </button>
      </form>
    </main>
  )
}
