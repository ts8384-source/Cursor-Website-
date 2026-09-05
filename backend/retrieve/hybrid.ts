import { siteFallback } from '../persist/site-files.ts'
import { runRag } from '../scripts/runner.ts'

export type SearchHit = {
  chunk_id: string
  doc_id: string
  title: string
  text: string
  score: number
  ground: string
}

/** Labeled per-ground merge only — no cross-ground RRF. */
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

export async function loadSite() {
  const result = await runRag(['site'], 30_000)
  if (!result.ok) {
    return { ok: true as const, data: { ...siteFallback(), hint: result.hint || result.error } }
  }
  return result
}
