import DOMPurify from 'dompurify'

// Teamo descriptions are HTML; strip anything executable but keep structure.
export function sanitize(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_ATTR: ['style', 'class'] })
}

// Pull the first image out so it can be used as the hero cover.
export function splitCover(html: string): { cover: string | null; body: string } {
  const doc = new DOMParser().parseFromString(sanitize(html), 'text/html')
  const first = doc.body.firstElementChild
  const img = first?.tagName === 'IMG' ? first : first?.querySelector(':scope > img:only-child')
  if (!img) return { cover: null, body: doc.body.innerHTML }
  const cover = img.getAttribute('src')
  ;(first?.tagName === 'IMG' ? first : first!).remove()
  return { cover, body: doc.body.innerHTML }
}
