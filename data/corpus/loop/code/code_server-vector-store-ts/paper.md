# server/vector-store.ts

/** Live retrieve path: Co-Assistant HybridIndex via Python (Chroma + BM25 + RRF). */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { diagramsDir, mdDir } from './paths'
import { runRag } from './rag-runner'

export type DocSource = 'papers' | 'code' | 'scribble' | 'cursor' | 'md'

export type SearchHit = {
  chunk_id: string
  doc_id: string
  title: string
  text: string
  score: number
  ground: string
}

export async function hybridSearch(query: string, limit = 8) {
  const result = await runRag(['search', '--query', query, '--k', String(limit)])
  if (!result.ok) {
    return { ok: false as const, error: result.error, hint: result.hint, hits: [] as SearchHit[] }
  }
  const payload = result.data as { per_ground?: Record<string, SearchHit[]> }
  const hits: SearchHit[] = []
  for (const [ground, list] of Object.entries(payload.per_ground ?? {})) {
    for (const hit of list) {
      hits.push({ ...hit, ground: hit.ground || ground })
    }
  }
  return { ok: true as const, merge: 'labeled-only', hits, per_ground: payload.per_ground ?? {} }
}

export async function runAsk(query = '') {
  const args = ['ask']
  if (query.trim()) args.push('--query', query)
  return runRag(args, 240_000)
}

export function siteFallback() {
  const mdPath = join(mdDir, 'architecture.md')
  const diagramPath = join(diagramsDir, 'latest.json')
  let diagram: unknown = { title: 'Hybrid RAG local-site loop', nodes: [], edges: [] }
  if (existsSync(diagramPath)) {
    try {
      diagram = JSON.parse(readFileSync(diagramPath, 'utf8'))
    } catch {
      // keep empty diagram
    }
  }
  return {
    article: existsSync(mdPath) ? readFileSync(mdPath, 'utf8') : '# Hybrid RAG local-site loop\n\nSeed the index to fill this page.\n',
    diagram,
    articlePath: 'data/md/architecture.md',
    fallback: true,
  }
}

export async function loadSite() {
  const result = await runRag(['site'], 30_000)
  if (!result.ok) {
    return { ok: true as const, data: { ...siteFallback(), hint: result.hint || result.error } }
  }
  return result
}
