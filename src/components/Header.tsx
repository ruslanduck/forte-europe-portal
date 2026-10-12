import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Logo } from './Logo'
import { DealSwitcher } from './DealSwitcher'

export function Header({ dealId }: { dealId?: string }) {
  const { session, logout } = useAuth()
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-brand">
          <Logo />
        </Link>
        <div className="header-actions">
          {session?.contact.role === 'admin' && <span className="admin-badge" title={session.contact.email}>Admin</span>}
          {dealId && <DealSwitcher currentId={dealId} />}
          {session && (
            <button className="btn-ghost" onClick={logout} title={session.contact.email}>
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
