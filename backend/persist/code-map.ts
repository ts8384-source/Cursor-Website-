import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { mapsDir, root } from '../paths.ts'
import { CURATED } from './paper-curated.ts'
import { hybridSearch } from '../retrieve/hybrid.ts'

export type MapKind = 'math' | 'diagram' | 'paper' | 'code'

export type MapNode = { kind: MapKind; id: string; label: string }

export type MapEdge = {
  id: string
  from: MapNode
  to: MapNode
  why: string
  paperId?: string
  source: 'curated' | 'fetch'
}

function edgesPath() {
  mkdirSync(mapsDir, { recursive: true })
  return join(mapsDir, 'edges.json')
}

function curatedEdges(): MapEdge[] {
  const edges: MapEdge[] = []
  for (const paper of CURATED) {
    for (const ex of paper.executedIn) {
      edges.push({
        id: `curated-${paper.id}-${ex.path}`,
        from: { kind: 'paper', id: paper.id, label: paper.id },
        to: { kind: 'code', id: ex.path, label: ex.path },
        why: ex.how,
        paperId: paper.id,
        source: 'curated',
      })
    }
    for (const m of paper.math) {
      for (const ex of paper.executedIn) {
        edges.push({
          id: `math-${paper.id}-${m.term}-${ex.path}`,
          from: { kind: 'math', id: m.term, label: m.term },
          to: { kind: 'code', id: ex.path, label: ex.path },
          why: m.def,
          paperId: paper.id,
          source: 'curated',
        })
      }
    }
    for (const d of paper.diagrams) {
      for (const ex of paper.executedIn.slice(0, 1)) {
        edges.push({
          id: `diag-${paper.id}-${d.label}`,
          from: { kind: 'diagram', id: `${paper.id}:${d.label}`, label: d.label },
          to: { kind: 'code', id: ex.path, label: ex.path },
          why: d.note,
          paperId: paper.id,
          source: 'curated',
        })
      }
    }
  }
  return edges
}

export function loadMaps() {
  const curated = curatedEdges()
  let extra: MapEdge[] = []
  const path = edgesPath()
  if (existsSync(path)) {
    try {
      extra = (JSON.parse(readFileSync(path, 'utf8')) as { edges?: MapEdge[] }).edges ?? []
    } catch {
      extra = []
    }
  }
  const seen = new Set(curated.map((e) => e.id))
  const edges = [...curated]
  for (const e of extra) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    edges.push(e)
  }
  return { edges, count: edges.length }
}

function saveExtra(edges: MapEdge[]) {
  writeFileSync(edgesPath(), JSON.stringify({ updatedAt: new Date().toISOString(), edges }, null, 2), 'utf8')
}

function localCodeHits(q: string) {
  const needle = q.toLowerCase()
  const guesses = [
    'backend/retrieve/hybrid.ts',
    'backend/persist/pages.ts',
    'backend/persist/paper-db.ts',
    'backend/persist/memory.ts',
    'backend/persist/code-map.ts',
    'backend/persist/tool-catalog.ts',
    'frontend/src/site/markdown.ts',
    'frontend/src/site/SiteApp.tsx',
    'rag/retrieve.py',
    'content/CONTROL.md',
    'data/diagrams/latest.json',
  ]
  return guesses.filter((p) => {
    if (p.toLowerCase().includes(needle)) return true
    const abs = join(root, p)
    if (!existsSync(abs)) return false
    try {
      return readFileSync(abs, 'utf8').toLowerCase().includes(needle)
    } catch {
      return false
    }
  })
}

export async function fetchCodeForQuery(q: string, kind: 'math' | 'diagram' = 'math') {
  const query = q.trim()
  if (!query) return { ok: false as const, error: 'q required', edges: [] as MapEdge[] }

  const added: MapEdge[] = []
  const paths = new Set(localCodeHits(query))

  const search = await hybridSearch(`${query} implementation code`, 6)
  if (search.ok) {
    for (const hit of search.hits) {
      if (hit.ground !== 'code') continue
      const path = hit.title || hit.doc_id
      if (path) paths.add(path)
    }
  }

  const existing = loadMaps()
  const extra = existing.edges.filter((e) => e.source === 'fetch')
  let n = extra.length
  for (const path of paths) {
    const id = `fetch-${kind}-${query}-${path}`.replace(/[^a-z0-9:_./-]+/gi, '-').slice(0, 160)
    if (existing.edges.some((e) => e.id === id)) continue
    const edge: MapEdge = {
      id,
      from: { kind, id: query, label: query },
      to: { kind: 'code', id: path, label: path },
      why: `On-demand map from ${kind} “${query}” to repo/code ground`,
      source: 'fetch',
    }
    extra.push(edge)
    added.push(edge)
    n += 1
  }
  saveExtra(extra)
  return {
    ok: true as const,
    q: query,
    kind,
    added,
    edges: loadMaps().edges.filter(
      (e) =>
        e.from.label.toLowerCase().includes(query.toLowerCase()) ||
        e.to.label.toLowerCase().includes(query.toLowerCase()) ||
        e.from.id.toLowerCase() === query.toLowerCase(),
    ),
    searchedIndex: search.ok,
  }
}

export function executionTable() {
  return CURATED.map((p) => ({
    paperId: p.id,
    summary: p.summary,
    executedIn: p.executedIn,
    math: p.math,
    diagrams: p.diagrams,
  }))
}
