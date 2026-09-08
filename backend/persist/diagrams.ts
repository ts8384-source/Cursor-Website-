import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { diagramsDir } from '../paths.ts'
import { parseUserRegions, withResolvedRegions } from './blankets.ts'
import { loadPaperDb } from './paper-db.ts'

export type NodeMeta = {
  summaryShort?: string
  summaryLong?: string
  pageId?: string
  paperIds?: string[]
  related?: string[]
}

export type DiagramNode = {
  id: string
  label: string
  group?: string
  detail?: string
  x?: number
  y?: number
  meta?: NodeMeta
}
export type DiagramEdge = {
  from: string
  to: string
  label?: string
  kind?: string
  direction?: string
  reversed?: boolean
  animated?: boolean
  learnable?: boolean
}
export type DiagramRegion = {
  id: string
  label: string
  nodeIds: string[]
  source?: 'user' | 'inferred'
}
export type DiagramGraph = {
  id: string
  title: string
  updatedAt: string
  source?: string
  /** Caption shown under the board. Absent = the generic hybrid-loop wording. */
  note?: string
  animatedEdges?: boolean
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  regions?: DiagramRegion[]
  blankets?: DiagramRegion[]
}

export function asEdges(raw: unknown): DiagramEdge[] {
  if (!Array.isArray(raw)) return []
  const out: DiagramEdge[] = []
  for (const item of raw) {
    if (Array.isArray(item) && item.length >= 2) {
      out.push({ from: String(item[0]), to: String(item[1]) })
      continue
    }
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const from = row.from ?? row.source
    const to = row.to ?? row.target
    if (from == null || to == null) continue
    out.push({
      from: String(from),
      to: String(to),
      label: row.label != null ? String(row.label) : undefined,
      kind: row.kind != null ? String(row.kind) : undefined,
      direction: row.direction != null ? String(row.direction) : undefined,
      reversed: row.reversed === true,
      animated: row.animated === true,
      learnable: row.learnable === true,
    })
  }
  return out
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v) => typeof v === 'string') as string[]
}

function asNodeMeta(row: Record<string, unknown>, detail?: string): NodeMeta | undefined {
  const raw = row.meta
  if (raw && typeof raw === 'object') {
    const m = raw as Record<string, unknown>
    const paperIds = asStringList(m.paperIds)
    const related = asStringList(m.related)
    return {
      summaryShort: m.summaryShort != null ? String(m.summaryShort) : undefined,
      summaryLong: m.summaryLong != null ? String(m.summaryLong) : detail,
      pageId: m.pageId != null ? String(m.pageId) : undefined,
      paperIds: paperIds.length ? paperIds : undefined,
      related: related.length ? related : undefined,
    }
  }
  if (!detail) return undefined
  return {
    summaryShort: detail.replace(/\s+/g, ' ').trim().split(' ').slice(0, 8).join(' '),
    summaryLong: detail,
  }
}

export function asNodes(raw: unknown): DiagramNode[] {
  if (!Array.isArray(raw)) return []
  const out: DiagramNode[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (row.id == null) continue
    const group = row.group ?? row.kind ?? row.cluster
    const detail = row.detail != null ? String(row.detail) : undefined
    out.push({
      id: String(row.id),
      label: row.label != null ? String(row.label) : String(row.id),
      group: group != null ? String(group) : undefined,
      detail,
      x: typeof row.x === 'number' ? row.x : undefined,
      y: typeof row.y === 'number' ? row.y : undefined,
      meta: asNodeMeta(row, detail),
    })
  }
  return out
}

function graphFromFile(file: string, raw: Record<string, unknown>): DiagramGraph {
  const stem = file.replace(/\.json$/i, '')
  const userRegions = parseUserRegions(raw.regions ?? raw.blankets)
  const graph: DiagramGraph = {
    id: raw.id != null ? String(raw.id) : stem,
    title: raw.title != null ? String(raw.title) : stem,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : '',
    source: raw.source != null ? String(raw.source) : undefined,
    note: raw.note != null ? String(raw.note) : undefined,
    animatedEdges: raw.animatedEdges === true,
    nodes: asNodes(raw.nodes),
    edges: asEdges(raw.edges),
    regions: userRegions,
    blankets: userRegions,
  }
  return withResolvedRegions(graph)
}

export function loadLoopDiagram(): DiagramGraph {
  const path = join(diagramsDir, 'latest.json')
  if (!existsSync(path)) {
    return { id: 'loop', title: 'No diagram yet', updatedAt: '', nodes: [], edges: [] }
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  return graphFromFile('latest.json', { ...raw, id: raw.id ?? 'hybrid-rag-loop' })
}

export function loadAllDiagrams(): DiagramGraph[] {
  if (!existsSync(diagramsDir)) return []
  const files = readdirSync(diagramsDir).filter((f) => f.endsWith('.json'))
  const graphs = files.map((file) => {
    const raw = JSON.parse(readFileSync(join(diagramsDir, file), 'utf8')) as Record<string, unknown>
    const idHint = file === 'latest.json' ? 'hybrid-rag-loop' : undefined
    return graphFromFile(file, { ...raw, id: raw.id ?? idHint })
  })
  graphs.sort((a, b) => {
    if (a.id === 'hybrid-rag-loop') return -1
    if (b.id === 'hybrid-rag-loop') return 1
    return a.title.localeCompare(b.title)
  })
  return graphs
}

export function diagramsPayload() {
  const loop = loadLoopDiagram()
  const db = loadPaperDb()
  return {
    loop,
    graphs: loadAllDiagrams(),
    paperFigures: db.figures,
    note: 'ColPali / ViDoRAG page-as-image retrieve is cited, not indexed. This is the text+JSON diagram store.',
  }
}
