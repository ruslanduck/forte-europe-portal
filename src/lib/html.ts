import DOMPurify from 'dompurify'

// Teamo descriptions are HTML; strip anything executable but keep structure.
export function sanitize(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_ATTR: ['style', 'class'] })
}

const isEmptyText = (node: Node) => node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()

// Images-only block: an <img>, or a paragraph/div that holds nothing but images and whitespace.
function imagesOf(el: Element): string[] | null {
  if (el.tagName === 'IMG') return [el.getAttribute('src') ?? '']
  if (!['P', 'DIV', 'FIGURE'].includes(el.tagName)) return null
  const nodes = [...el.childNodes].filter((n) => !isEmptyText(n) && n.nodeName !== 'BR')
  if (!nodes.length || !nodes.every((n) => n.nodeName === 'IMG')) return null
  return nodes.map((n) => (n as Element).getAttribute('src') ?? '')
}

// The images a description starts with become the gallery at the top of the event page;
// the rest of the description keeps its own structure and inline images.
export function splitGallery(html: string): { gallery: string[]; body: string } {
  const doc = new DOMParser().parseFromString(sanitize(html), 'text/html')
  const gallery: string[] = []
  let el = doc.body.firstElementChild
  while (el) {
    const imgs = imagesOf(el)
    if (!imgs) break
    gallery.push(...imgs.filter(Boolean))
    const next = el.nextElementSibling
    el.remove()
    el = next
  }
  return { gallery, body: doc.body.innerHTML }
}
