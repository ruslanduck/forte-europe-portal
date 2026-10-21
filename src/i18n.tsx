import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setFormatLocale } from './lib/format'

// Interface language. Content from Teamo (descriptions, names, cost lines) is translated by the backend;
// these are the portal's own words. English is the source language of everything.
export const LANGS = ['en', 'es', 'fr'] as const
export type Lang = (typeof LANGS)[number]
export const LANG_LABEL: Record<Lang, string> = { en: 'English', es: 'Español', fr: 'Français' }
const LOCALE: Record<Lang, string> = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR' }

const en = {
  // header and login
  'header.admin': 'Admin',
  'header.logout': 'Log out',
  'header.language': 'Language',
  'login.title': 'Your event proposal',
  'login.intro': 'Sign in with the login and password from your Forte Europe proposal.',
  'login.login': 'Login',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.busy': 'Signing in…',
  footer: '© {year} Forte Europe. All rights reserved. This information is privileged and confidential.',
  // deals
  'deals.my': 'My Deals',
  'deals.all': 'All Deals',
  'deals.search': 'Search by deal name or ID',
  'deals.name': 'Deal name',
  'deals.id': 'ID',
  'deals.created': 'Created',
  'deals.noMatch': 'No deals match “{query}”.',
  'deals.none': 'No proposals are shared with this account yet.',
  'pager.prev': 'Previous page',
  'pager.next': 'Next page',
  close: 'Close',
  // deal page
  'deal.eyebrow': 'Preliminary proposal for services',
  'deal.preparedFor': 'Prepared exclusively for {name}',
  'deal.dates': 'Dates',
  'deal.destination': 'Destination',
  'deal.guests': 'Guests',
  'deal.pax': '{n} PAX',
  'deal.contact': 'Your Forte Europe contact',
  'deal.contacts': 'Your Forte Europe contacts',
  'deal.programme': 'Programme',
  'deal.fullProposal': 'Full proposal',
  'deal.costing': 'Costing',
  'deal.preparing': 'Preparing your programme… this can take a few seconds',
  'deal.loadingProgramme': 'Loading your programme…',
  back: 'Back to programme',
  loading: 'Loading…',
  // event page
  'event.aboutSchedule': 'About this part of the programme',
  'event.map': 'Map: {name}',
  'event.openMap': 'Open in Google Maps',
  // costing
  'costing.eyebrow': 'Costing',
  'costing.pricesIncl': 'All prices in EUR, VAT included.',
  'costing.pricesExcl': 'All prices in EUR, excluding VAT.',
  'costing.calculating': 'Calculating your costing… this can take a few seconds',
  'costing.item': 'Item',
  'costing.qty': 'Qty',
  'costing.unit': 'Unit',
  'costing.unitPrice': 'Unit price',
  'costing.vat': 'VAT',
  'costing.total': 'Total',
  'costing.subtotal': 'Subtotal',
  'costing.grandIncl': 'Grand total (VAT included)',
  'costing.grandExcl': 'Grand total (excl. VAT)',
  'costing.cancelled': 'Cancelled · not included in totals',
  'costing.cancelledNote': 'Items marked as cancelled are shown for reference and are not included in any totals.',
  'costing.empty': 'No costing has been prepared for this proposal yet.',
  'costing.download': 'Download Excel',
  'costing.downloadInternal': 'Download internal Excel (all columns)',
  'costing.preparing': 'Preparing…',
  // full proposal
  'proposal.eyebrow': 'Full proposal',
  'proposal.preparing': 'Preparing your proposal… this can take a few seconds',
  'proposal.progress': 'Preparing… {done}/{total}',
  'proposal.photos': 'Loading photos…',
  'proposal.print': 'Print Proposal',
  'proposal.failed': 'This description could not be loaded.',
  'proposal.fileName': '{title} – Forte Europe Proposal',
  // Excel
  'xl.title': 'Costing',
  'xl.titleInternal': 'Costing (internal)',
  'xl.downloaded': 'Downloaded',
  'xl.created': 'Created',
  'xl.client': 'Client',
  'xl.programName': 'Program Name',
  'xl.contact': 'Contact',
  'xl.programCode': 'Program Code',
  'xl.programDate': 'Program Date',
  'xl.destinations': 'Destination(s)',
  'xl.pricesIncl': 'Prices include VAT',
  'xl.pricesExcl': 'Prices exclude VAT',
  'xl.qty': 'Qty',
  'xl.unitDescription': 'Unit\nDescription',
  'xl.unitPrice': 'Unit Price\n€',
  'xl.unitPriceIncl': 'Unit Price\n(Incl Tax)\n€',
  'xl.vat': 'VAT %',
  'xl.totalPrice': 'Total Price\n€',
  'xl.totalPriceIncl': 'Total Price\n(Incl Tax)\n€',
  'xl.comments': 'Comments',
  'xl.cancelled': '(cancelled, not included in totals)',
  'xl.grandTotal': 'Grand total',
  'xl.file': '{title} - Costing',
  'xl.fileInternal': '{title} - Costing (internal)',
}
export type Key = keyof typeof en

const es: Record<Key, string> = {
  'header.admin': 'Admin',
  'header.logout': 'Cerrar sesión',
  'header.language': 'Idioma',
  'login.title': 'Su propuesta de evento',
  'login.intro': 'Inicie sesión con el usuario y la contraseña de su propuesta de Forte Europe.',
  'login.login': 'Usuario',
  'login.password': 'Contraseña',
  'login.submit': 'Iniciar sesión',
  'login.busy': 'Iniciando sesión…',
  footer: '© {year} Forte Europe. Todos los derechos reservados. Esta información es privilegiada y confidencial.',
  'deals.my': 'Mis propuestas',
  'deals.all': 'Todas las propuestas',
  'deals.search': 'Buscar por nombre o ID',
  'deals.name': 'Propuesta',
  'deals.id': 'ID',
  'deals.created': 'Creada',
  'deals.noMatch': 'Ninguna propuesta coincide con «{query}».',
  'deals.none': 'Todavía no hay propuestas compartidas con esta cuenta.',
  'pager.prev': 'Página anterior',
  'pager.next': 'Página siguiente',
  close: 'Cerrar',
  'deal.eyebrow': 'Propuesta preliminar de servicios',
  'deal.preparedFor': 'Preparada en exclusiva para {name}',
  'deal.dates': 'Fechas',
  'deal.destination': 'Destino',
  'deal.guests': 'Participantes',
  'deal.pax': '{n} PAX',
  'deal.contact': 'Su contacto en Forte Europe',
  'deal.contacts': 'Sus contactos en Forte Europe',
  'deal.programme': 'Programa',
  'deal.fullProposal': 'Propuesta completa',
  'deal.costing': 'Presupuesto',
  'deal.preparing': 'Preparando su programa… puede tardar unos segundos',
  'deal.loadingProgramme': 'Cargando su programa…',
  back: 'Volver al programa',
  loading: 'Cargando…',
  'event.aboutSchedule': 'Sobre esta parte del programa',
  'event.map': 'Mapa: {name}',
  'event.openMap': 'Abrir en Google Maps',
  'costing.eyebrow': 'Presupuesto',
  'costing.pricesIncl': 'Todos los precios en EUR, IVA incluido.',
  'costing.pricesExcl': 'Todos los precios en EUR, IVA no incluido.',
  'costing.calculating': 'Calculando su presupuesto… puede tardar unos segundos',
  'costing.item': 'Concepto',
  'costing.qty': 'Cant.',
  'costing.unit': 'Unidad',
  'costing.unitPrice': 'Precio unitario',
  'costing.vat': 'IVA',
  'costing.total': 'Total',
  'costing.subtotal': 'Subtotal',
  'costing.grandIncl': 'Total general (IVA incluido)',
  'costing.grandExcl': 'Total general (IVA no incluido)',
  'costing.cancelled': 'Cancelado · no incluido en los totales',
  'costing.cancelledNote': 'Los conceptos marcados como cancelados se muestran como referencia y no se incluyen en ningún total.',
  'costing.empty': 'Todavía no se ha preparado el presupuesto de esta propuesta.',
  'costing.download': 'Descargar Excel',
  'costing.downloadInternal': 'Descargar Excel interno (todas las columnas)',
  'costing.preparing': 'Preparando…',
  'proposal.eyebrow': 'Propuesta completa',
  'proposal.preparing': 'Preparando su propuesta… puede tardar unos segundos',
  'proposal.progress': 'Preparando… {done}/{total}',
  'proposal.photos': 'Cargando fotos…',
  'proposal.print': 'Imprimir propuesta',
  'proposal.failed': 'No se pudo cargar esta descripción.',
  'proposal.fileName': '{title} – Propuesta Forte Europe',
  'xl.title': 'Presupuesto',
  'xl.titleInternal': 'Presupuesto (interno)',
  'xl.downloaded': 'Descargado',
  'xl.created': 'Creado',
  'xl.client': 'Cliente',
  'xl.programName': 'Programa',
  'xl.contact': 'Contacto',
  'xl.programCode': 'Código del programa',
  'xl.programDate': 'Fechas del programa',
  'xl.destinations': 'Destino(s)',
  'xl.pricesIncl': 'Precios con IVA incluido',
  'xl.pricesExcl': 'Precios sin IVA',
  'xl.qty': 'Cant.',
  'xl.unitDescription': 'Unidad',
  'xl.unitPrice': 'Precio\nunitario\n€',
  'xl.unitPriceIncl': 'Precio\nunitario\n(IVA incl.)\n€',
  'xl.vat': 'IVA %',
  'xl.totalPrice': 'Precio\ntotal\n€',
  'xl.totalPriceIncl': 'Precio\ntotal\n(IVA incl.)\n€',
  'xl.comments': 'Comentarios',
  'xl.cancelled': '(cancelado, no incluido en los totales)',
  'xl.grandTotal': 'Total general',
  'xl.file': '{title} - Presupuesto',
  'xl.fileInternal': '{title} - Presupuesto (interno)',
}

const fr: Record<Key, string> = {
  'header.admin': 'Admin',
  'header.logout': 'Se déconnecter',
  'header.language': 'Langue',
  'login.title': 'Votre proposition d’événement',
  'login.intro': 'Connectez-vous avec l’identifiant et le mot de passe de votre proposition Forte Europe.',
  'login.login': 'Identifiant',
  'login.password': 'Mot de passe',
  'login.submit': 'Se connecter',
  'login.busy': 'Connexion…',
  footer: '© {year} Forte Europe. Tous droits réservés. Ces informations sont confidentielles.',
  'deals.my': 'Mes propositions',
  'deals.all': 'Toutes les propositions',
  'deals.search': 'Rechercher par nom ou ID',
  'deals.name': 'Proposition',
  'deals.id': 'ID',
  'deals.created': 'Créée',
  'deals.noMatch': 'Aucune proposition ne correspond à « {query} ».',
  'deals.none': 'Aucune proposition n’est encore partagée avec ce compte.',
  'pager.prev': 'Page précédente',
  'pager.next': 'Page suivante',
  close: 'Fermer',
  'deal.eyebrow': 'Proposition préliminaire de services',
  'deal.preparedFor': 'Préparée exclusivement pour {name}',
  'deal.dates': 'Dates',
  'deal.destination': 'Destination',
  'deal.guests': 'Participants',
  'deal.pax': '{n} PAX',
  'deal.contact': 'Votre contact Forte Europe',
  'deal.contacts': 'Vos contacts Forte Europe',
  'deal.programme': 'Programme',
  'deal.fullProposal': 'Proposition complète',
  'deal.costing': 'Budget',
  'deal.preparing': 'Préparation de votre programme… cela peut prendre quelques secondes',
  'deal.loadingProgramme': 'Chargement de votre programme…',
  back: 'Retour au programme',
  loading: 'Chargement…',
  'event.aboutSchedule': 'À propos de cette partie du programme',
  'event.map': 'Carte : {name}',
  'event.openMap': 'Ouvrir dans Google Maps',
  'costing.eyebrow': 'Budget',
  'costing.pricesIncl': 'Tous les prix en EUR, TVA incluse.',
  'costing.pricesExcl': 'Tous les prix en EUR, hors TVA.',
  'costing.calculating': 'Calcul de votre budget… cela peut prendre quelques secondes',
  'costing.item': 'Prestation',
  'costing.qty': 'Qté',
  'costing.unit': 'Unité',
  'costing.unitPrice': 'Prix unitaire',
  'costing.vat': 'TVA',
  'costing.total': 'Total',
  'costing.subtotal': 'Sous-total',
  'costing.grandIncl': 'Total général (TVA incluse)',
  'costing.grandExcl': 'Total général (hors TVA)',
  'costing.cancelled': 'Annulé · non inclus dans les totaux',
  'costing.cancelledNote': 'Les prestations marquées comme annulées sont affichées pour information et ne sont incluses dans aucun total.',
  'costing.empty': 'Le budget de cette proposition n’a pas encore été préparé.',
  'costing.download': 'Télécharger l’Excel',
  'costing.downloadInternal': 'Télécharger l’Excel interne (toutes les colonnes)',
  'costing.preparing': 'Préparation…',
  'proposal.eyebrow': 'Proposition complète',
  'proposal.preparing': 'Préparation de votre proposition… cela peut prendre quelques secondes',
  'proposal.progress': 'Préparation… {done}/{total}',
  'proposal.photos': 'Chargement des photos…',
  'proposal.print': 'Imprimer la proposition',
  'proposal.failed': 'Cette description n’a pas pu être chargée.',
  'proposal.fileName': '{title} – Proposition Forte Europe',
  'xl.title': 'Budget',
  'xl.titleInternal': 'Budget (interne)',
  'xl.downloaded': 'Téléchargé',
  'xl.created': 'Créé',
  'xl.client': 'Client',
  'xl.programName': 'Programme',
  'xl.contact': 'Contact',
  'xl.programCode': 'Code du programme',
  'xl.programDate': 'Dates du programme',
  'xl.destinations': 'Destination(s)',
  'xl.pricesIncl': 'Prix TVA incluse',
  'xl.pricesExcl': 'Prix hors TVA',
  'xl.qty': 'Qté',
  'xl.unitDescription': 'Unité',
  'xl.unitPrice': 'Prix\nunitaire\n€',
  'xl.unitPriceIncl': 'Prix\nunitaire\n(TTC)\n€',
  'xl.vat': 'TVA %',
  'xl.totalPrice': 'Prix\ntotal\n€',
  'xl.totalPriceIncl': 'Prix\ntotal\n(TTC)\n€',
  'xl.comments': 'Commentaires',
  'xl.cancelled': '(annulé, non inclus dans les totaux)',
  'xl.grandTotal': 'Total général',
  'xl.file': '{title} - Budget',
  'xl.fileInternal': '{title} - Budget (interne)',
}

const DICT: Record<Lang, Record<Key, string>> = { en, es, fr }

export type T = (key: Key, vars?: Record<string, string | number>) => string
export const translator = (lang: Lang): T => (key, vars) =>
  DICT[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? ''))

const STORE = 'fe-lang'
const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang)
function stored(): Lang | null {
  try {
    const v = localStorage.getItem(STORE)
    return isLang(v) ? v : null
  } catch {
    return null
  }
}

interface I18n {
  lang: Lang
  t: T
  // The visitor's own choice; it wins over the deal's language and is remembered in this browser.
  choose: (lang: Lang) => void
  // The language set on the deal in Teamo, used while the visitor has not chosen one.
  setDealLanguage: (lang?: string) => void
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState<Lang | null>(stored)
  const [dealLang, setDealLang] = useState<Lang | null>(null)
  const lang: Lang = chosen ?? dealLang ?? 'en'
  setFormatLocale(LOCALE[lang])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const choose = useCallback((l: Lang) => {
    setChosen(l)
    try {
      localStorage.setItem(STORE, l)
    } catch {
      // Not remembered across visits; the choice still applies now.
    }
  }, [])
  const setDealLanguage = useCallback((l?: string) => setDealLang(isLang(l) ? l : null), [])

  const value = useMemo(() => ({ lang, t: translator(lang), choose, setDealLanguage }), [lang, choose, setDealLanguage])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n outside I18nProvider')
  return ctx
}

// Language sent to the backend for content translation (English is the original, so none is needed).
export const contentLang = (lang: Lang) => (lang === 'en' ? undefined : lang)

// Cache keys per content language, so switching language never shows the other language's cached texts.
export const keys = {
  deal: (dealId: string, lang: Lang) => `deal:${dealId}:${lang}`,
  costing: (dealId: string, lang: Lang) => `costing:${dealId}:${lang}`,
  event: (dealId: string, scheduleId: string | undefined, eventId: string, lang: Lang) => `event:${dealId}:${scheduleId}:${eventId}:${lang}`,
}
