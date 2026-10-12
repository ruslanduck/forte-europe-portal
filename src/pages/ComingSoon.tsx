import { Link, useParams } from 'react-router-dom'
import { Header } from '../components/Header'

export function ComingSoon({ title }: { title: string }) {
  const { dealId = '' } = useParams()
  return (
    <>
      <Header dealId={dealId} />
      <main className="container page">
        <Link className="back" to={`/deals/${dealId}`}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back to programme
        </Link>
        <h1 className="hero-title">{title}</h1>
        <p className="muted">This section is being built.</p>
      </main>
    </>
  )
}
