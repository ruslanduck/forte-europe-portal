export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo" aria-label="Forte Europe">
      <svg viewBox="0 0 40 52" className="logo-mark" aria-hidden="true">
        <path d="M0 0h40v8H11v12h25v8H11v12H0z" fill="var(--red)" />
        <path d="M0 44h40v8H0z" fill="var(--red)" />
      </svg>
      {!compact && (
        <span className="logo-text">
          Forte
          <br />
          Europe
        </span>
      )}
    </span>
  )
}
