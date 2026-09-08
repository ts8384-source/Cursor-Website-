import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PageTreeNode } from './types'
import { useFlaggedSlugs } from './SandboxFlagControl'

type Props = {
  tree: PageTreeNode[]
  slug: string
  variant?: 'nav' | 'map'
}

export function WikiPageTree({ tree, slug, variant = 'nav' }: Props) {
  const { slugs: flagged } = useFlaggedSlugs()
  const [open, setOpen] = useState<Set<string>>(() => new Set(idsToOpen(tree, slug)))

  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev)
      for (const id of idsToOpen(tree, slug)) next.add(id)
      return next
    })
  }, [slug, tree])

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expand = (id: string) => {
    setOpen((prev) => new Set(prev).add(id))
  }

  return (
    <ol className={variant === 'map' ? 'wiki-map-tree' : 'toc-pages toc-tree'}>
      {tree.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          slug={slug}
          variant={variant}
          depth={0}
          openIds={open}
          flagged={flagged}
          onToggle={toggle}
          onExpand={expand}
        />
      ))}
    </ol>
  )
}

function TreeItem({
  node,
  slug,
  variant,
  depth,
  openIds,
  flagged,
  onToggle,
  onExpand,
}: {
  node: PageTreeNode
  slug: string
  variant: 'nav' | 'map'
  depth: number
  openIds: Set<string>
  flagged: string[]
  onToggle: (id: string) => void
  onExpand: (id: string) => void
}) {
  const kids = node.children
  const hasKids = kids.length > 0
  const panelId = `wiki-kids-${node.slug}`
  const current = node.slug === slug
  const open = variant === 'map' || openIds.has(node.id)

  return (
    <li>
      <div
        className={`wiki-row wiki-row-${variant}${current ? ' is-current' : ''}${depth > 0 ? ' is-sub' : ' is-page'}`}
      >
        {variant === 'nav' && hasKids ? (
          <button
            type="button"
            className="wiki-twist"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? `Hide pages under ${node.nav}` : `Show pages under ${node.nav}`}
            onClick={() => onToggle(node.id)}
          >
            <span aria-hidden="true">{open ? '▾' : '▸'}</span>
          </button>
        ) : (
          <span className="wiki-twist-spacer" aria-hidden="true" />
        )}
        <Link
          className={`${current ? 'is-active' : ''}${node.highlight ? ` wiki-hl wiki-hl-${node.highlight}` : ''}`.trim()}
          to={node.href || `/site/${node.slug}`}
          aria-current={current ? 'page' : undefined}
          onClick={() => {
            if (hasKids) onExpand(node.id)
          }}
        >
          <span className="wiki-nav-label">
            <span className="wiki-nav-text">{node.nav}</span>
            {/* Nav rail: only role badges. Page/Sub chips clutter scanning (handbook 12:3 / 16:2). */}
            {variant === 'map' && depth === 0 && hasKids ? (
              <span className="wiki-badge wiki-badge-page">Page</span>
            ) : null}
            {variant === 'map' && depth > 0 ? <span className="wiki-badge wiki-badge-sub">Sub</span> : null}
            <HighlightBadge role={node.highlight} />
            {flagged.includes(node.slug) ? (
              <span className="wiki-badge wiki-badge-flagged" title="Flagged in lab">
                ·
              </span>
            ) : null}
          </span>
          {variant === 'map' && node.gist ? <span className="wiki-map-gist">{node.gist}</span> : null}
        </Link>
      </div>
      {hasKids && open ? (
        <ol id={panelId} className="wiki-kids">
          {kids.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              slug={slug}
              variant={variant}
              depth={depth + 1}
              openIds={openIds}
              flagged={flagged}
              onToggle={onToggle}
              onExpand={onExpand}
            />
          ))}
        </ol>
      ) : null}
    </li>
  )
}

function HighlightBadge({ role }: { role?: string }) {
  if (role === 'start') return <span className="wiki-badge wiki-badge-start">Start</span>
  if (role === 'queue') return <span className="wiki-badge wiki-badge-queue">Queue</span>
  if (role === 'lab') return <span className="wiki-badge wiki-badge-lab">Lab</span>
  return null
}

function idsToOpen(tree: PageTreeNode[], slug: string): string[] {
  const found: string[] = []
  const walk = (nodes: PageTreeNode[], ancestors: string[]): boolean => {
    for (const node of nodes) {
      if (node.slug === slug) {
        found.push(...ancestors, node.id)
        return true
      }
      if (walk(node.children, [...ancestors, node.id])) return true
    }
    return false
  }
  walk(tree, [])
  return found
}
