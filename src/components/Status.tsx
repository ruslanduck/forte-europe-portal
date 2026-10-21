import { useI18n } from '../i18n'

export function Loading({ label }: { label?: string }) {
  const { t } = useI18n()
  return (
    <div className="status" role="status">
      <span className="spinner" aria-hidden="true" /> {label ?? t('loading')}
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
