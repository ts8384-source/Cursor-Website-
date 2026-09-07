import { aliasesFor, listMeta, loadMeta, type MetaRecord, type MetaType } from './meta.ts'

/** Wiki graph types. Boards stay off the canvas (ephemeral pad keys). */
export const GRAPH_TYPES: MetaType[] = ['page', 'paper', 'module', 'diagram', 'node', 'code']

export type GraphEdgeKind = 'related' | 'cites' | 'derived_from' | 'implements' | 'page' | 'paper'

export type WikiGraphNode = {
  id: string
  type: MetaType
  title: string
  href?: string
  slug?: string
  summary: { short: string; long: string }
  tags: string[]
  project?: string
}

export type WikiGraphEdge = {
  id: string
  from: string
  to: string
  kind: GraphEdgeKind
}

export type WikiGraph = {
  id: 'wiki-knowledge-graph'
  title: string
  rule: string
  count: { nodes: number; edges: number }
  nodes: WikiGraphNode[]
  edges: WikiGraphEdge[]
}

export type WikiNeighborhood = WikiGraph & {
  focus: string
  hops: number
  missing: boolean
  href?: string
}

function asNode(r: MetaRecord): WikiGraphNode {
  const tagged = r.tags.find((t) => t.startsWith('project:'))
  const project = (r.project || tagged?.slice('project:'.length) || '').replace(/^project:/, '')
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    href: r.href,
    slug: r.slug,
    summary: r.summary,
    tags: r.tags,
    project: project || undefined,
  }
}

/** Project neighborhood plus framework nodes that already have an edge. Not a second graph store. */
export function filterGraphByProject(graph: WikiGraph, projectRaw: string): WikiGraph {
  const project = projectRaw.trim().replace(/^project:/, '').toLowerCase()
  if (!project) return graph
  const owned = new Set(
    graph.nodes
      .filter((n) => (n.project ?? '').toLowerCase() === project || n.tags.some((t) => t.toLowerCase() === `project:${project}`))
      .map((n) => n.id),
  )
  const keep = new Set(owned)
  for (const e of graph.edges) {
    if (owned.has(e.from)) keep.add(e.to)
    if (owned.has(e.to)) keep.add(e.from)
  }
  const nodes = graph.nodes.filter((n) => keep.has(n.id))
  const edges = graph.edges.filter((e) => keep.has(e.from) && keep.has(e.to))
  return {
    ...graph,
    title: `${graph.title} (${project})`,
    rule: `${graph.rule} Filtered to project:${project} plus explicit framework↔project edges.`,
    nodes,
    edges,
    count: { nodes: nodes.length, edges: edges.length },
  }
}

function addEdge(
  edges: Map<string, WikiGraphEdge>,
  known: Set<string>,
  from: string,
  to: string,
  kind: GraphEdgeKind,
) {
  if (!from || !to || from === to) return
  if (!known.has(from) || !known.has(to)) return
  const id = `${kind}:${from}->${to}`
  if (edges.has(id)) return
  edges.set(id, { id, from, to, kind })
}

function wikiRecords(): MetaRecord[] {
  return listMeta().filter((r) => GRAPH_TYPES.includes(r.type))
}

/** One graph over meta links. No invented edges. No community detection. */
export function buildKnowledgeGraph(): WikiGraph {
  const records = wikiRecords()
  const known = new Set(records.map((r) => r.id))
  const edges = new Map<string, WikiGraphEdge>()
  for (const r of records) {
    for (const id of r.related) addEdge(edges, known, r.id, id, 'related')
    for (const id of r.citations) addEdge(edges, known, r.id, id, 'cites')
    for (const id of r.implements ?? []) addEdge(edges, known, r.id, id, 'implements')
    for (const id of r.derived_from ?? []) addEdge(edges, known, r.id, id, 'derived_from')
    if (r.pageId) addEdge(edges, known, r.id, r.pageId, 'page')
    for (const id of r.paperIds ?? []) addEdge(edges, known, r.id, id, 'paper')
  }
  const list = [...edges.values()]
  return {
    id: 'wiki-knowledge-graph',
    title: 'Wiki knowledge graph',
    rule: 'View over GET /api/meta related, citations, implements, derived_from, pageId, paperIds. Isolated grounds stay isolated. Not Microsoft GraphRAG communities.',
    count: { nodes: records.length, edges: list.length },
    nodes: records.map(asNode),
    edges: list,
  }
}

export function resolveGraphId(raw: string): string | null {
  const id = decodeURIComponent(raw).trim()
  if (!id) return null
  const rec = loadMeta(id)
  if (rec && GRAPH_TYPES.includes(rec.type)) return rec.id
  const wanted = new Set(aliasesFor(id))
  const hit = wikiRecords().find((r) => wanted.has(r.id))
  return hit?.id ?? null
}

export function graphNeighborhood(focusRaw: string, hops = 1): WikiNeighborhood {
  const graph = buildKnowledgeGraph()
  const hopsN = Math.max(0, Math.min(4, Math.floor(hops)))
  const focus = resolveGraphId(focusRaw)
  if (!focus) {
    return {
      ...graph,
      nodes: [],
      edges: [],
      count: { nodes: 0, edges: 0 },
      focus: focusRaw,
      hops: hopsN,
      missing: true,
    }
  }
  const adj = new Map<string, Set<string>>()
  for (const e of graph.edges) {
    if (!adj.has(e.from)) adj.set(e.from, new Set())
    if (!adj.has(e.to)) adj.set(e.to, new Set())
    adj.get(e.from)!.add(e.to)
    adj.get(e.to)!.add(e.from)
  }
  const keep = new Set<string>([focus])
  let frontier = [focus]
  for (let i = 0; i < hopsN; i += 1) {
    const next: string[] = []
    for (const id of frontier) {
      for (const n of adj.get(id) ?? []) {
        if (keep.has(n)) continue
        keep.add(n)
        next.push(n)
      }
    }
    frontier = next
  }
  const nodes = graph.nodes.filter((n) => keep.has(n.id))
  const edges = graph.edges.filter((e) => keep.has(e.from) && keep.has(e.to))
  const self = nodes.find((n) => n.id === focus)
  return {
    ...graph,
    nodes,
    edges,
    count: { nodes: nodes.length, edges: edges.length },
    focus,
    hops: hopsN,
    missing: false,
    href: self?.href,
  }
}

function tokens(q: string) {
  return q
    .toLowerCase()
    .split(/[^a-z0-9:._-]+/)
    .filter((t) => t.length > 2)
}

/** Labeled graph hits for retrieve. Not RRF-fused into other grounds. */
export function graphAsHits(query: string, limit = 8) {
  const q = query.trim()
  if (!q) return []
  const resolved = resolveGraphId(q)
  const seeds: string[] = []
  if (resolved) seeds.push(resolved)
  const qTokens = tokens(q)
  if (!seeds.length && qTokens.length) {
    for (const n of buildKnowledgeGraph().nodes) {
      const hay = `${n.id} ${n.title} ${n.tags.join(' ')}`.toLowerCase()
      if (qTokens.some((t) => hay.includes(t))) seeds.push(n.id)
      if (seeds.length >= 4) break
    }
  }
  const seen = new Set<string>()
  const hits: {
    chunk_id: string
    doc_id: string
    title: string
    text: string
    score: number
    ground: 'graph'
  }[] = []
  for (const seed of seeds) {
    const hood = graphNeighborhood(seed, 1)
    for (const n of hood.nodes) {
      if (seen.has(n.id)) continue
      seen.add(n.id)
      hits.push({
        chunk_id: n.id,
        doc_id: n.id,
        title: n.title,
        text: `graph neighbor of ${hood.focus}. ${n.summary.short}. ${n.href ?? ''}`.slice(0, 360),
        score: n.id === hood.focus ? 1 : 0.7,
        ground: 'graph',
      })
      if (hits.length >= limit) return hits
    }
  }
  return hits
}

export function knowledgeGraphPayload(focus?: string, hops = 1, project?: string) {
  const full = buildKnowledgeGraph()
  const graph = project?.trim() ? filterGraphByProject(full, project) : full
  if (!focus?.trim()) return { ...graph, focus: null, hops: 0, missing: false, project: project?.trim() || null }
  const hood = graphNeighborhood(focus, hops)
  const scoped = project?.trim() ? filterGraphByProject(hood, project) : hood
  return {
    ...graph,
    focus: hood.missing ? focus : hood.focus,
    hops: hood.hops,
    missing: hood.missing,
    project: project?.trim() || null,
    neighborhood: hood.missing ? null : { nodes: scoped.nodes.map((n) => n.id), edges: scoped.edges.map((e) => e.id) },
  }
}
