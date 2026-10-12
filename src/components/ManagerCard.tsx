import type { Manager } from '../api/types'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

export function ManagerCard({ manager }: { manager: Manager }) {
  return (
    <article className="manager">
      {manager.photoUrl ? (
        <img className="manager-photo" src={manager.photoUrl} alt="" />
      ) : (
        <div className="manager-photo manager-initials" aria-hidden="true">
          {initials(manager.name)}
        </div>
      )}
      <div className="manager-body">
        <h3 className="manager-name">{manager.name}</h3>
        {manager.role && <p className="manager-role">{manager.role}</p>}
        <ul className="manager-contacts">
          {manager.phone && (
            <li>
              <a href={`tel:${manager.phone.replace(/\s/g, '')}`}>{manager.phone}</a>
              {manager.phoneType && <span className="muted"> · {manager.phoneType}</span>}
            </li>
          )}
          {manager.email && (
            <li>
              <a href={`mailto:${manager.email}`}>{manager.email}</a>
            </li>
          )}
        </ul>
      </div>
    </article>
  )
}
