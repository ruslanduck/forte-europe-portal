export function Loading() {
  return (
    <div className="status" role="status">
      <span className="spinner" aria-hidden="true" /> Loading…
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="status status-error" role="alert">
      {message}
    </div>
  )
}
