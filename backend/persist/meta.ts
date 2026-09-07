import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir } from '../paths.ts'
import { listTiedBoards, type TiedBoard } from './boards.ts'
import { loadAllDiagrams, type DiagramGraph, type NodeMeta } from './diagrams.ts'
import { listPages, type GlossaryEntry, type PageMeta } from './pages.ts'
import { loadPaperDb } from './paper-db.ts'
import { listSandboxFlags } from './sandbox-flags.ts'

export const META_TYPES = ['page', 'paper', 'node', 'module', 'diagram', 'board', 'code'] as const
export type MetaType = (typeof META_TYPES)[number]

export type MetaSummary = { short: string; long: string }

export type MetaNest = 'encyclopedia' | 'sandbox' | 'hidden' | 'corpus'

export type MetaFlags = {
  hidden?: boolean
  flagged?: boolean
  highlight?: string
}

export type MetaRecord = {
  id: string
  type: MetaType
  title: string
  slug?: string
  href?: string
  summary: MetaSummary
  tags: string[]
  citations: string[]
  related: string[]
  glossary: GlossaryEntry[]
  updated: string
  pageId?: string
  paperIds?: string[]
  boardKey?: string
  sourceSlug?: string
  sourceType?: string
  surface?: string
  assetPath?: string
  kind?: string
  implements?: string[]
  derived_from?: string[]
  path?: string
  parent?: string
  children?: string[]
  sandbox?: boolean
  sandboxLane?: string
  nest?: MetaNest
  flags?: MetaFlags
  graphDegree?: number
  citationCount?: number
  relatedCount?: number
  project?: string
}

export type MetaFilter = {
  q?: string
  type?: MetaType
  tag?: string
  citation?: string
  related?: string
  nest?: MetaNest
  parent?: string
  flagged?: boolean
  project?: string
}

const MODULES: MetaRecord[] = [
  {
    id: 'module:search',
    type: 'module',
    title: 'Hybrid search',
    href: '/docs/hybrid-rag',
    summary: {
      short: 'Labeled retrieve, isolated grounds',
      long: 'GET /api/search and POST /api/ask. Hits stay labeled by ground. Metadata title and tags are boosted; they are not RRF-fused across libraries.',
    },
    tags: ['rag', 'search', 'aci'],
    citations: ['hm-rag-2025', 'gorilla-2023'],
    related: ['page:hybrid-rag', 'module:diagrams'],
    glossary: [{ term: 'ground', def: 'Isolated retrieve index. No cross-ground RRF.' }],
    updated: '2026-09-05',
  },
  {
    id: 'module:diagrams',
    type: 'module',
    title: 'Diagrams',
    href: '/docs/diagrams',
    summary: {
      short: 'React Flow plus node metadata',
      long: 'GET /api/diagrams. Nodes stay small; click opens summaryLong and id links below the canvas.',
    },
    tags: ['diagram', 'react-flow'],
    citations: ['vidorag-2025', 'colpali-2024', 'dashboard-design-patterns-2022'],
    related: ['page:diagrams', 'diagram:hybrid-rag-loop'],
    glossary: [],
    updated: '2026-09-05',
  },
  {
    id: 'module:summaries',
    type: 'module',
    title: 'Paper summaries',
    href: '/docs/summaries',
    summary: {
      short: 'Permanent paper DB gists',
      long: 'GET /api/papers/db. Same paper ids as the metadata bus. Papers do not forget.',
    },
    tags: ['papers', 'summary'],
    citations: ['paper-plain-august-2023'],
    related: ['page:summaries', 'page:papers'],
    glossary: [],
    updated: '2026-09-05',
  },
  {
    id: 'module:maps',
    type: 'module',
    title: 'Math and diagram maps',
    href: '/docs/maps',
    summary: {
      short: 'Math and diagram to code',
      long: 'GET /api/maps and POST /api/maps/fetch. Edges cite the same paper and node ids.',
    },
    tags: ['maps', 'code'],
    citations: ['living-papers-heer-2023'],
    related: ['page:maps', 'module:diagrams', 'page:tied-boards'],
    glossary: [],
    updated: '2026-09-05',
  },
  {
    id: 'module:memory',
    type: 'module',
    title: 'Memory with forgetting',
    href: '/docs/memory',
    summary: {
      short: 'User and project decay',
      long: 'GET /api/memory. Half-life decay on user/project lanes. supersedes hides the old note from retrieve. Forget writes AUDIT. Papers and data/md never decay.',
    },
    tags: ['memory', 'forgetting'],
    citations: ['agent-workflow-memory-2024'],
    related: ['page:memory'],
    glossary: [],
    updated: '2026-09-05',
  },
  {
    id: 'module:tied-boards',
    type: 'module',
    title: 'Tied iPad boards',
    href: '/docs/tied-boards',
    summary: {
      short: 'Site button sends a board to the live pad',
      long: 'Two on-demand buttons. Clean: metadata only, empty pad. Stamped: frontend JPEG of the diagram or article PDF (server rasters pages), papers use the local PDF. 4s capture timeout then POST. ACTIVE; pad polls. No PC tab.',
    },
    tags: ['ipad', 'board', 'meta'],
    citations: ['living-papers-heer-2023', 'swe-agent-2024'],
    related: ['page:tied-boards', 'page:inbox'],
    glossary: [{ term: 'tied board', def: 'tldraw key plus site metadata for scribbling on a page, paper, diagram, or math.' }],
    updated: '2026-09-06',
  },
  {
    id: 'module:code-meta',
    type: 'module',
    title: 'Code chunk metadata',
    href: '/docs/code-meta',
    summary: {
      short: 'Comment @chunk records on the bus',
      long: 'Parser extracts # / // / /* @chunk */ blocks without executing code. Seed writes data/meta/code.json. GET /api/meta?type=code. Not a second metadata bus.',
    },
    tags: ['code', 'meta', 'rag'],
    citations: ['hm-rag-2025', 'living-papers-heer-2023'],
    related: ['page:code-meta', 'page:hybrid-rag', 'module:search'],
    glossary: [{ term: '@chunk', def: 'Comment-only metadata fence. Same fields as GET /api/meta records of type code.' }],
    updated: '2026-09-06',
  },
  {
    id: 'module:knowledge-graph',
    type: 'module',
    title: 'Wiki knowledge graph',
    href: '/docs/knowledge-graph',
    summary: {
      short: 'One graph over meta links',
      long: 'GET /api/graph and GET /api/graph/neighborhood. Built from related, citations, implements, derived_from, pageId, paperIds. Jump focuses the same graph. Not a new RRF soup or community detection.',
    },
    tags: ['graph', 'meta', 'retrieve'],
    citations: ['graphrag-2024', 'living-papers-heer-2023'],
    related: ['page:knowledge-graph', 'page:metadata', 'module:search', 'page:agents'],
    glossary: [{ term: 'jump-to-node', def: 'Focus an existing meta id on the one wiki graph. Never rebuild a per-section graph.' }],
    updated: '2026-09-06',
  },
  {
    id: 'module:agents',
    type: 'module',
    title: 'Isolated agent hats',
    href: '/docs/agents',
    summary: {
      short: 'Coding, fetch, generate stay separate',
      long: 'Thin operator skills. Fetch is cite-or-fetch plus the wiki graph. Coding implements against wiki/fetch results. Generate seeds an in-DB paperId. MGM tripwire is a flag only.',
    },
    tags: ['agents', 'aci'],
    citations: ['swe-agent-2024', 'gorilla-2023'],
    related: ['page:agents', 'page:agents-coding', 'page:agents-fetch', 'page:agents-generate', 'page:control'],
    glossary: [],
    updated: '2026-09-06',
  },
]

function words(text: string, n: number) {
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).slice(0, n).join(' ')
}

function tokens(q: string) {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
}

function pageIdOf(page: PageMeta) {
  return page.id || `page:${page.slug}`
}

function pageNest(page: PageMeta): MetaNest {
  if (page.hidden) return 'hidden'
  if (page.sandbox) return 'sandbox'
  return 'encyclopedia'
}

function fromPage(page: PageMeta, flagged: Set<string>): MetaRecord {
  const id = pageIdOf(page)
  const short = page.summaryShort || words(page.gist || page.title, 8)
  const long = page.summaryLong || page.gist || page.title
  const nest = pageNest(page)
  return {
    id,
    type: 'page',
    title: page.title,
    slug: page.slug,
    href: page.href,
    summary: { short, long },
    tags: page.tags.length ? page.tags : [page.nav.toLowerCase()],
    citations: page.citations,
    related: page.related,
    glossary: page.glossary,
    updated: page.updated || '',
    parent: page.parent || undefined,
    children: page.children.length ? page.children : undefined,
    sandbox: page.sandbox,
    sandboxLane: page.sandboxLane || undefined,
    project: page.project || undefined,
    nest,
    flags: {
      hidden: page.hidden,
      flagged: flagged.has(page.slug),
      highlight: page.highlight || '',
    },
    path: page.path,
    citationCount: page.citations.length,
    relatedCount: page.related.length,
  }
}

function nodeRecordId(graphId: string, nodeId: string) {
  return `node:${graphId}:${nodeId}`
}

function fromNodeMeta(graph: DiagramGraph, nodeId: string, label: string, nm?: NodeMeta): MetaRecord {
  const pageId = nm?.pageId
  const paperIds = nm?.paperIds ?? []
  const short = nm?.summaryShort || words(nm?.summaryLong || label, 8)
  const long = nm?.summaryLong || nm?.summaryShort || label
  const related = [...(nm?.related ?? [])]
  if (pageId && !related.includes(pageId)) related.push(pageId)
  for (const pid of paperIds) {
    if (!related.includes(pid)) related.push(pid)
  }
  return {
    id: nodeRecordId(graph.id, nodeId),
    type: 'node',
    title: label,
    href: `/docs/diagrams#${nodeId}`,
    summary: { short, long },
    tags: [graph.id, ...(nm?.pageId ? ['linked-page'] : [])],
    citations: paperIds,
    related,
    glossary: [],
    updated: graph.updatedAt || '',
    pageId,
    paperIds,
  }
}

function fromBoard(board: TiedBoard): MetaRecord {
  return {
    id: board.id,
    type: 'board',
    title: board.title,
    slug: board.sourceSlug,
    href: board.href,
    summary: board.summary,
    tags: board.tags,
    citations: board.citations,
    related: uniqRelated(board.related, board.pageId, board.paperIds),
    glossary: [],
    updated: board.updated,
    pageId: board.pageId,
    paperIds: board.paperIds,
    boardKey: board.boardKey,
    sourceSlug: board.sourceSlug,
    sourceType: board.sourceType,
    surface: board.surface,
    assetPath: board.assetPath,
  }
}

function uniqRelated(related: string[], pageId?: string, paperIds: string[] = []) {
  const out = [...related]
  if (pageId && !out.includes(pageId)) out.push(pageId)
  for (const pid of paperIds) {
    if (!out.includes(pid)) out.push(pid)
  }
  return out
}

function loadCodeRecords(): MetaRecord[] {
  const path = join(dataDir, 'meta', 'code.json')
  if (!existsSync(path)) return []
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as { records?: MetaRecord[] }
    const rows = raw.records ?? []
    return rows.filter((r) => r && r.type === 'code' && typeof r.id === 'string')
  } catch {
    return []
  }
}

function fromDiagram(graph: DiagramGraph): MetaRecord {
  return {
    id: `diagram:${graph.id}`,
    type: 'diagram',
    title: graph.title,
    href: '/docs/diagrams',
    summary: {
      short: words(graph.title, 8),
      long: `${graph.title}: ${graph.nodes.length} nodes, ${graph.edges.length} edges, ${(graph.regions ?? graph.blankets ?? []).length} regions. Click a node for metadata.`,
    },
    tags: ['diagram', graph.id],
    citations: [],
    related: graph.nodes.map((n) => nodeRecordId(graph.id, n.id)),
    glossary: [],
    updated: graph.updatedAt || '',
  }
}

function attachGraphDegrees(records: MetaRecord[]): MetaRecord[] {
  const known = new Set(records.map((r) => r.id))
  const deg = new Map<string, number>()
  const bump = (a: string, b: string) => {
    if (!a || !b || a === b || !known.has(a) || !known.has(b)) return
    deg.set(a, (deg.get(a) ?? 0) + 1)
    deg.set(b, (deg.get(b) ?? 0) + 1)
  }
  for (const r of records) {
    for (const id of r.related) bump(r.id, id)
    for (const id of r.citations) bump(r.id, id)
    for (const id of r.implements ?? []) bump(r.id, id)
    for (const id of r.derived_from ?? []) bump(r.id, id)
    if (r.pageId) bump(r.id, r.pageId)
    for (const id of r.paperIds ?? []) bump(r.id, id)
    if (r.parent) bump(r.id, r.parent)
  }
  return records.map((r) => ({
    ...r,
    graphDegree: deg.get(r.id) ?? 0,
    citationCount: r.citationCount ?? r.citations.length,
    relatedCount: r.relatedCount ?? r.related.length,
  }))
}

export function listMeta(): MetaRecord[] {
  const flagged = new Set(listSandboxFlags().slugs)
  const pages = listPages().map((p) => fromPage(p, flagged))
  const papers = loadPaperDb().papers.map((p) => {
    const related = pages.filter((pg) => pg.citations.includes(p.id)).map((pg) => pg.id)
    return {
      id: p.id,
      type: 'paper' as const,
      title: p.title,
      href: `/docs/papers#${p.id}`,
      summary: { short: words(p.summary || p.title, 8), long: p.summary || p.title },
      tags: [p.list, p.year, p.venue].filter(Boolean).map((t) => t.toLowerCase()),
      citations: [p.id],
      related,
      glossary: p.math.map((m) => ({ term: m.term, def: m.def })),
      updated: '',
      nest: 'corpus' as const,
      citationCount: 1,
      relatedCount: related.length,
    }
  })
  const graphs = loadAllDiagrams()
  const diagrams = graphs.map(fromDiagram)
  const nodes = graphs.flatMap((g) => g.nodes.map((n) => fromNodeMeta(g, n.id, n.label, n.meta)))
  const boards = listTiedBoards().map(fromBoard)
  const code = loadCodeRecords()
  const out = attachGraphDegrees([...pages, ...papers, ...diagrams, ...nodes, ...MODULES, ...boards, ...code])
  out.sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id))
  return out
}

export function filterMeta(filter: MetaFilter = {}): { count: number; records: MetaRecord[] } {
  const qTokens = filter.q ? tokens(filter.q) : []
  let records = listMeta()
  if (filter.type) records = records.filter((r) => r.type === filter.type)
  if (filter.tag) {
    const tag = filter.tag.toLowerCase()
    records = records.filter((r) => r.tags.some((t) => t.toLowerCase() === tag || t.toLowerCase().includes(tag)))
  }
  if (filter.citation) records = records.filter((r) => r.citations.includes(filter.citation!))
  if (filter.related) records = records.filter((r) => r.id === filter.related || r.related.includes(filter.related!))
  if (filter.nest) records = records.filter((r) => r.nest === filter.nest)
  if (filter.parent) records = records.filter((r) => r.parent === filter.parent || r.id === filter.parent)
  if (filter.flagged === true) records = records.filter((r) => r.flags?.flagged === true)
  if (filter.flagged === false) records = records.filter((r) => r.flags?.flagged !== true)
  if (filter.project) {
    const key = filter.project.replace(/^project:/, '').toLowerCase()
    records = records.filter((r) => (r.project ?? '').toLowerCase() === key)
  }
  if (qTokens.length) {
    records = records.filter((r) => {
      const hay = `${r.id} ${r.title} ${r.summary.short} ${r.summary.long} ${r.tags.join(' ')} ${r.citations.join(' ')}`.toLowerCase()
      return qTokens.every((t) => hay.includes(t)) || qTokens.some((t) => hay.includes(t))
    })
  }
  return { count: records.length, records }
}

export function aliasesFor(id: string): string[] {
  const out = [id]
  if (!id.includes(':')) {
    out.push(`page:${id}`, `diagram:${id}`, `module:${id}`, `node:hybrid-rag-loop:${id}`)
    if (!id.startsWith('code:')) out.push(`code:${id}`, `code:loop.${id}`)
  }
  return out
}

export function loadMeta(id: string): MetaRecord | null {
  const wanted = new Set(aliasesFor(decodeURIComponent(id)))
  return listMeta().find((r) => wanted.has(r.id)) ?? null
}

export function metaIndex(filter: MetaFilter = {}) {
  const { count, records } = filterMeta(filter)
  return {
    schema: 'data/meta/schema.json',
    bus: 'Shared ids for pages, papers, diagram nodes, modules, tied iPad boards, and code chunks. Pages expose parent, nest (encyclopedia|sandbox|hidden), flags, href, and computed graphDegree.',
    count,
    records,
  }
}

/** Cheap title/tag preference. Does not RRF across grounds. */
export function boostByMeta<T extends { title: string; text?: string; score: number }>(hits: T[], query: string): T[] {
  const qTokens = tokens(query)
  if (!qTokens.length) return hits
  const { records } = filterMeta({ q: query })
  return hits
    .map((hit) => {
      let extra = 0
      const title = hit.title.toLowerCase()
      if (qTokens.some((t) => title.includes(t))) extra += 0.18
      for (const rec of records.slice(0, 20)) {
        const recTitle = rec.title.toLowerCase()
        if (title.includes(recTitle.slice(0, Math.min(12, recTitle.length))) || recTitle.includes(title.slice(0, 12))) {
          extra += 0.12
        }
        if (rec.tags.some((tag) => qTokens.some((t) => tag.toLowerCase().includes(t)))) extra += 0.06
      }
      return { ...hit, score: hit.score + extra }
    })
    .sort((a, b) => b.score - a.score)
}

export function metaAsHits(query: string, limit = 8) {
  const wantBoards = /\bboard\b|board:|tied-board/i.test(query)
  return filterMeta({ q: query })
    .records.filter((r) => wantBoards || r.type !== 'board')
    .slice(0, limit)
    .map((r) => ({
    chunk_id: r.id,
    doc_id: r.id,
    title: r.title,
    text: `${r.summary.short}. ${r.summary.long}`.slice(0, 360),
    score: 1,
    ground: 'meta',
  }))
}

export function askBias(query: string) {
  const titles = filterMeta({ q: query })
    .records.slice(0, 4)
    .map((r) => r.title)
  if (!titles.length || !query.trim()) return query
  return `${query.trim()} ${titles.join(' ')}`
}
