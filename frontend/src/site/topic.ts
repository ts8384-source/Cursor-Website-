import type { PageMeta } from './types'

/** Anchor for a child rendered as a section of its topic. Keeps old /site/<child> links addressable. */
export const sectionId = (slug: string) => `sec-${slug}`

/**
 * A topic root absorbs its children as in-page sections.
 * Board pages carry a highlight (Overview start / Lab bench lab / To-implement queue) and keep their
 * own chrome, so the lab bench never swallows every note under it.
 */
export function isTopicRoot(page?: Pick<PageMeta, 'highlight' | 'hidden' | 'children'> | null): boolean {
  return Boolean(page && !page.hidden && !page.highlight && page.children?.length)
}

const idOf = (page: PageMeta) => page.id || `page:${page.slug}`

function nestedChildren(root: PageMeta | null, pages: PageMeta[]): PageMeta[] {
  if (!isTopicRoot(root) || !root) return []
  const byId = new Map(pages.map((p) => [idOf(p), p]))
  return (root.children ?? [])
    .map((id) => byId.get(id))
    .filter((p): p is PageMeta => Boolean(p) && !p!.hidden)
}

/** Children folded into the topic page as sections. */
export function topicChildren(root: PageMeta | null, pages: PageMeta[]): PageMeta[] {
  return nestedChildren(root, pages).filter((p) => !p.subpage)
}

/** Children that asked to stay on their own route — appendix material, linked from the topic. */
export function topicSubpages(root: PageMeta | null, pages: PageMeta[]): PageMeta[] {
  return nestedChildren(root, pages).filter((p) => p.subpage)
}

/** The topic that renders `slug` as a section, or null when `slug` owns its own route. */
export function topicRootFor(slug: string, pages: PageMeta[]): PageMeta | null {
  const page = pages.find((p) => p.slug === slug)
  if (!page?.parent || page.subpage) return null
  const parent = pages.find((p) => idOf(p) === page.parent)
  return isTopicRoot(parent) ? (parent as PageMeta) : null
}

/**
 * Every topic in the wiki, for the left rail. Deliberately not scoped to the current branch:
 * the same list on every page makes the rail a fixed map you can learn (handbook 7:1), instead of
 * something that empties out the moment you open a deep dive.
 */
export function allTopics(pages: PageMeta[]): PageMeta[] {
  // Subject pages are written on the lab bench, so sandbox is not a reason to leave one out.
  // isTopicRoot already drops board chrome (Overview, Lab bench, To-implement) via `highlight`.
  return pages.filter(isTopicRoot).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
}

/** The topic the rail should mark while `page` is open — itself, or the topic that owns it. */
export function owningTopic(page: PageMeta | null, pages: PageMeta[]): PageMeta | null {
  if (!page) return null
  if (isTopicRoot(page)) return page
  const parent = pages.find((p) => idOf(p) === page.parent)
  return isTopicRoot(parent) ? (parent as PageMeta) : null
}
