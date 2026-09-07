import type { DiagramGraph, DiagramNode, DiagramRegion } from './diagrams.ts'

/** High-level layers for the hybrid local-site loop only. Labels stay "iPad" / "local PC" / "website". */
export const DEFAULT_REGIONS = [
  { id: 'ipad', label: 'iPad' },
  { id: 'local-pc', label: 'local PC' },
  { id: 'website', label: 'website' },
] as const

/** @deprecated Use DEFAULT_REGIONS — same three layers, no extra jargon. */
export const DEFAULT_BLANKETS = DEFAULT_REGIONS

const HYBRID_LOOP_IDS = new Set(['hybrid-rag-loop', 'latest', 'loop'])

const IPAD_RE = /\b(ipad|scribble|inbox|pencil)\b|\bpad\b/
const SITE_RE = /\b(site|frontend|website|demo|wiki|vis|visual)\b|\bpage\b/

function isHybridLoop(id?: string): boolean {
  return Boolean(id && HYBRID_LOOP_IDS.has(id))
}

function tokens(node: DiagramNode): string {
  const slug = node.meta?.pageId?.replace(/^page:/, '') ?? ''
  const tags = (node.meta?.related ?? []).join(' ')
  const bits = [
    node.id,
    node.label,
    node.group,
    slug,
    tags,
    node.meta?.summaryShort,
    node.detail,
  ]
  return bits
    .filter(Boolean)
    .join(' ')
    .replace(/page:/gi, '')
    .replace(/book\s*keep/gi, 'bookkeep')
    .toLowerCase()
}

/**
 * Hybrid-loop partition only: scribble/inbox → iPad; site/wiki/vis/frontend → website;
 * everything else on that loop → local PC. Do not treat the `page:` prefix as "page".
 */
export function scoreRegion(node: DiagramNode): 'ipad' | 'local-pc' | 'website' {
  const hay = tokens(node)
  if (IPAD_RE.test(hay)) return 'ipad'
  if (node.group === 'site' || SITE_RE.test(hay)) return 'website'
  if (/\bpage\b/.test(hay) && !node.meta?.pageId) return 'website'
  return 'local-pc'
}

/** @deprecated Use scoreRegion. */
export function scoreBlanket(node: DiagramNode): 'ipad' | 'local-pc' | 'website' | null {
  return scoreRegion(node)
}

function asRegion(row: Record<string, unknown>): DiagramRegion | null {
  if (row.id == null) return null
  const nodeIds = Array.isArray(row.nodeIds)
    ? row.nodeIds.filter((id): id is string => typeof id === 'string')
    : []
  const source = row.source === 'user' || row.source === 'inferred' ? row.source : 'user'
  return {
    id: String(row.id),
    label: row.label != null ? String(row.label) : String(row.id),
    nodeIds,
    source,
  }
}

export function parseUserRegions(raw: unknown): DiagramRegion[] {
  if (!Array.isArray(raw)) return []
  const out: DiagramRegion[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const region = asRegion(item as Record<string, unknown>)
    if (region) out.push(region)
  }
  return out
}

function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

function mergeUserRegions(graph: {
  regions?: DiagramRegion[]
  blankets?: DiagramRegion[]
}): DiagramRegion[] {
  const user = [...(graph.regions ?? []), ...(graph.blankets ?? [])].map((r) => ({
    ...r,
    source: r.source ?? 'user',
  }))
  const seenUser = new Set<string>()
  const mergedUser: DiagramRegion[] = []
  for (const region of user) {
    if (seenUser.has(region.id)) continue
    seenUser.add(region.id)
    mergedUser.push({ ...region, nodeIds: [...region.nodeIds] })
  }
  return mergedUser
}

/** Fill the three hybrid layers. Leftover nodes join local PC. Never invent a fourth id. */
export function inferHybridRegions(nodes: DiagramNode[], claimed: Set<string>): DiagramRegion[] {
  const buckets: Record<(typeof DEFAULT_REGIONS)[number]['id'], string[]> = {
    ipad: [],
    'local-pc': [],
    website: [],
  }
  for (const node of nodes) {
    if (claimed.has(node.id)) continue
    buckets[scoreRegion(node)].push(node.id)
  }
  return DEFAULT_REGIONS.map((def) => ({
    id: def.id,
    label: def.label,
    nodeIds: buckets[def.id],
    source: 'inferred' as const,
  }))
}

/**
 * Hybrid local-site loop: exactly iPad / local PC / website; every node in one.
 * Other diagrams (RSNN): keep author regions only — do not attach this three-way split.
 */
export function resolveRegions(graph: {
  id?: string
  nodes: DiagramNode[]
  regions?: DiagramRegion[]
  blankets?: DiagramRegion[]
}): DiagramRegion[] {
  const mergedUser = mergeUserRegions(graph)
  if (!isHybridLoop(graph.id)) return mergedUser

  const extras = mergedUser.filter((r) => !DEFAULT_REGIONS.some((d) => d.id === r.id))
  const claimed = new Set(mergedUser.flatMap((r) => r.nodeIds))
  const inferred = inferHybridRegions(graph.nodes, claimed)
  const three = DEFAULT_REGIONS.map((def) => {
    const user = mergedUser.find((r) => r.id === def.id)
    const added = inferred.find((r) => r.id === def.id)?.nodeIds ?? []
    const nodeIds = uniqueIds([...(user?.nodeIds ?? []), ...added])
    const source = user && added.length === 0 ? (user.source ?? 'user') : user ? user.source ?? 'user' : 'inferred'
    return {
      id: def.id,
      label: user?.label ?? def.label,
      nodeIds,
      source,
    }
  })
  return [...three, ...extras]
}

/** @deprecated Use resolveRegions. */
export function resolveBlankets(graph: {
  id?: string
  nodes: DiagramNode[]
  regions?: DiagramRegion[]
  blankets?: DiagramRegion[]
}): DiagramRegion[] {
  return resolveRegions(graph)
}

export function withResolvedRegions(graph: DiagramGraph): DiagramGraph {
  const regions = resolveRegions(graph)
  return { ...graph, regions, blankets: regions }
}

/** @deprecated Use withResolvedRegions. */
export function withResolvedBlankets(graph: DiagramGraph): DiagramGraph {
  return withResolvedRegions(graph)
}
