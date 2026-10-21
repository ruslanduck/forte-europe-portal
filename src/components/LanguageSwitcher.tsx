import { LANG_LABEL, LANGS, useI18n } from '../i18n'

// EN / ES / FR toggle; the choice is remembered in this browser and overrides the deal's language.
export function LanguageSwitcher() {
  const { lang, choose, t } = useI18n()
  return (
    <div className="lang-switch" role="group" aria-label={t('header.language')}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? 'is-active' : undefined}
          aria-pressed={l === lang}
          title={LANG_LABEL[l]}
          onClick={() => choose(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
