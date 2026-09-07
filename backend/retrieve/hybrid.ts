import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { graphAsHits } from '../persist/graph.ts'
import { askBias, boostByMeta, metaAsHits } from '../persist/meta.ts'
import { memoryAsHits } from '../persist/memory.ts'
import { mdDir } from '../paths.ts'
import { siteFallback } from '../persist/site-files.ts'
import { runRag } from '../scripts/runner.ts'
import {
  citationIds,
  citeOrFetchEnvelope,
  flattenRetrieved,
  groundClaims,
  type SearchHit,
} from './cite-or-fetch.ts'

export type { SearchHit } from './cite-or-fetch.ts'
/** Labeled per-ground merge only — no cross-ground RRF. */
export async function hybridSearch(query: string, limit = 8) {
  const result = await runRag(['search', '--query', query, '--k', String(limit)])
  if (!result.ok) {
    const metaHits = metaAsHits(query)
    const memHits = memoryAsHits(query)
    const graphHits = graphAsHits(query)
    return {
      ok: false as const,
      error: result.error,
      hint: result.hint,
      hits: [...metaHits, ...memHits, ...graphHits],
      meta: { count: metaHits.length, prefer: 'title+tags' },
      graph: { count: graphHits.length, merge: 'labeled-only' },
    }
  }
  const payload = result.data as { per_ground?: Record<string, SearchHit[]> }
  const hits: SearchHit[] = []
  for (const [ground, list] of Object.entries(payload.per_ground ?? {})) {
    for (const hit of list) {
      hits.push({ ...hit, ground: hit.ground || ground })
    }
  }
  const boosted = boostByMeta(hits, query)
  const metaHits = metaAsHits(query)
  const memHits = memoryAsHits(query)
  const graphHits = graphAsHits(query)
  return {
    ok: true as const,
    merge: 'labeled-only',
    hits: [...metaHits, ...memHits, ...graphHits, ...boosted],
    per_ground: payload.per_ground ?? {},
    meta: { count: metaHits.length, prefer: 'title+tags' },
    graph: { count: graphHits.length, merge: 'labeled-only', retrieve: 'GET /api/graph/neighborhood' },
  }
}

function latestAskArticle() {
  try {
    return readFileSync(join(mdDir, 'architecture.md'), 'utf8')
  } catch {
    return ''
  }
}

export async function runAsk(query = '') {
  const args = ['ask']
  const q = askBias(query)
  if (q.trim()) args.push('--query', q)
  const result = await runRag(args, 240_000)
  const rag = (result.data ?? {}) as {
    query?: string
    md?: string
    diagram?: string
    retrieved?: unknown
    hits?: unknown
  }
  let hits = flattenRetrieved(rag.retrieved)
  if (!hits.length) {
    const search = await hybridSearch(q || query, 8)
    hits = search.hits
  }
  const idea = rag.query || q || query
  const article = latestAskArticle() || idea
  const grounding = groundClaims(article, hits)
  return {
    ok: result.ok,
    error: result.error,
    hint: result.hint,
    query: idea,
    hits,
    md: rag.md ?? 'data/md/architecture.md',
    diagram: rag.diagram ?? 'data/diagrams/latest.json',
    retrieved: rag.retrieved,
    citations: citationIds(hits),
    citeOrFetch: citeOrFetchEnvelope(hits, idea),
    grounding,
    data: result.data,
  }
}

export async function loadSite() {
  const result = await runRag(['site'], 30_000)
  if (!result.ok) {
    return { ok: true as const, data: { ...siteFallback(), hint: result.hint || result.error } }
  }
  return result
}
