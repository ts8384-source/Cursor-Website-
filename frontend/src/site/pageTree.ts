import type { PageMeta, PageTreeNode } from './types'

export function buildPageTree(pages: PageMeta[]): PageTreeNode[] {
  const visible = pages.filter((p) => !p.hidden && (!p.sandbox || Boolean(p.parent)))
  const byId = new Map(visible.map((p) => [p.id || `page:${p.slug}`, p]))
  const childrenOf = (page: PageMeta): PageTreeNode[] => {
    const ids = page.children?.length
      ? page.children
      : visible.filter((c) => c.parent && (c.parent === (page.id || `page:${page.slug}`))).map((c) => c.id || `page:${c.slug}`)
    return ids
      .map((id) => byId.get(id))
      .filter((child): child is PageMeta => Boolean(child))
      .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
      .map(toNode)
  }
  const toNode = (page: PageMeta): PageTreeNode => ({
    id: page.id || `page:${page.slug}`,
    slug: page.slug,
    nav: page.nav,
    title: page.title,
    gist: page.gist,
    highlight: page.highlight || '',
    href: page.href || (page.bin === 'doc' ? `/docs/${page.slug}` : `/site/${page.slug}`),
    bin: page.bin,
    children: childrenOf(page),
  })
  return visible
    .filter((p) => !p.sandbox && (!p.parent || !byId.has(p.parent)))
    .map(toNode)
}

export function ancestorIds(pages: PageMeta[], slug: string): string[] {
  const bySlug = new Map(pages.map((p) => [p.slug, p]))
  const byId = new Map(pages.map((p) => [p.id || `page:${p.slug}`, p]))
  const out: string[] = []
  const seen = new Set<string>()
  let cur = bySlug.get(slug)
  while (cur?.parent && !seen.has(cur.parent)) {
    seen.add(cur.parent)
    out.push(cur.parent)
    cur = byId.get(cur.parent)
  }
  return out
}

export function crumbTrail(pages: PageMeta[], slug: string): PageMeta[] {
  const bySlug = new Map(pages.map((p) => [p.slug, p]))
  const byId = new Map(pages.map((p) => [p.id || `page:${p.slug}`, p]))
  const trail: PageMeta[] = []
  const seen = new Set<string>()
  let cur = bySlug.get(slug)
  while (cur && !seen.has(cur.slug)) {
    seen.add(cur.slug)
    trail.unshift(cur)
    cur = cur.parent ? byId.get(cur.parent) : undefined
  }
  return trail
}
