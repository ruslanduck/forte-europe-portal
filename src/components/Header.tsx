import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Logo } from './Logo'
import { DealSwitcher } from './DealSwitcher'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useI18n } from '../i18n'

export function Header({ dealId }: { dealId?: string }) {
  const { session, logout } = useAuth()
  const { t } = useI18n()
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-brand">
          <Logo />
        </Link>
        <div className="header-actions">
          {session?.contact.role === 'admin' && <span className="admin-badge" title={session.contact.email}>{t('header.admin')}</span>}
          <LanguageSwitcher />
          {dealId && <DealSwitcher currentId={dealId} />}
          {session && (
            <button className="btn-ghost" onClick={logout} title={session.contact.email}>
              {t('header.logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
