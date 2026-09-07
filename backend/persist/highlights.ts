import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir } from '../paths.ts'

/** Fork-ready chrome roles. Frontmatter `highlight` wins; this file is the template fallback. */
export type HighlightRole = 'start' | 'queue' | 'lab'

export type HighlightRoleCopy = {
  badge: string
  hint: string
}

const DEFAULT_ROLES: Record<HighlightRole, HighlightRoleCopy> = {
  start: { badge: 'Start', hint: 'cream map — the live page tree' },
  queue: { badge: 'Queue', hint: 'slate tickets — not the family tree' },
  lab: { badge: 'Lab', hint: 'Lab bench — agents write children here, not the encyclopedia' },
}

export function isHighlightRole(value: unknown): value is HighlightRole {
  return value === 'start' || value === 'queue' || value === 'lab'
}

export function loadHighlightConfig() {
  const file = join(dataDir, 'site', 'highlights.json')
  let bySlug: Record<string, HighlightRole> = { overview: 'start', implement: 'queue' }
  let roles = { ...DEFAULT_ROLES }
  if (existsSync(file)) {
    try {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as {
        bySlug?: Record<string, unknown>
        roles?: Record<string, { badge?: string; hint?: string }>
      }
      if (raw.bySlug && typeof raw.bySlug === 'object') {
        const next: Record<string, HighlightRole> = {}
        for (const [slug, role] of Object.entries(raw.bySlug)) {
          if (isHighlightRole(role)) next[slug] = role
        }
        if (Object.keys(next).length) bySlug = next
      }
      for (const key of ['start', 'queue', 'lab'] as const) {
        const row = raw.roles?.[key]
        if (row && typeof row.badge === 'string' && row.badge.trim()) {
          roles[key] = {
            badge: row.badge.trim(),
            hint: typeof row.hint === 'string' ? row.hint : DEFAULT_ROLES[key].hint,
          }
        }
      }
    } catch {
      /* keep defaults */
    }
  }
  return { bySlug, roles }
}

export function resolveHighlight(slug: string, frontmatter: unknown): HighlightRole | '' {
  if (isHighlightRole(frontmatter)) return frontmatter
  const { bySlug } = loadHighlightConfig()
  return bySlug[slug] ?? ''
}

export function highlightCopy(role: HighlightRole | '') {
  if (!role) return null
  return loadHighlightConfig().roles[role]
}
