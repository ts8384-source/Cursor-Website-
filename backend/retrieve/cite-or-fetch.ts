import { listPapers } from '../persist/papers-catalog.ts'

export type SearchHit = {
  chunk_id: string
  doc_id: string
  title: string
  text: string
  score: number
  ground: string
}

const STOP = new Set([
  'the',
  'and',
  'for',
  'are',
  'was',
  'were',
  'this',
  'that',
  'with',
  'from',
  'not',
  'but',
  'you',
  'your',
  'into',
  'onto',
  'than',
  'then',
  'also',
  'only',
  'have',
  'has',
  'had',
  'can',
  'may',
  'use',
  'used',
  'using',
])

export type CiteOrFetch = {
  mustCite: true
  hits: SearchHit[]
  notInDb: string | null
  fetch: 'POST /api/papers/fetch'
}

export type Grounding = {
  cited: { id: string; ground: string; title: string }[]
  unsupported: string[]
}

export function tokenize(text: string): Set<string> {
  const out = new Set<string>()
  for (const raw of text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []) {
    if (!STOP.has(raw)) out.add(raw)
  }
  return out
}

export function flattenRetrieved(retrieved: unknown): SearchHit[] {
  const hits: SearchHit[] = []
  if (!retrieved || typeof retrieved !== 'object') return hits
  const per = (retrieved as { per_ground?: Record<string, SearchHit[]> }).per_ground
  if (!per) return hits
  for (const [ground, list] of Object.entries(per)) {
    for (const hit of list ?? []) {
      hits.push({
        chunk_id: hit.chunk_id || hit.doc_id,
        doc_id: hit.doc_id,
        title: hit.title,
        text: hit.text ?? '',
        score: Number(hit.score) || 0,
        ground: hit.ground || ground,
      })
    }
  }
  return hits
}

export function splitClaims(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 28 && !s.startsWith('#') && !s.startsWith('|') && !s.startsWith('- '))
}

function hitId(hit: SearchHit) {
  return hit.chunk_id || hit.doc_id
}

export function groundClaims(article: string, hits: SearchHit[]): Grounding {
  const bags = hits.map((h) => ({
    hit: h,
    tokens: tokenize(`${h.title} ${h.text} ${h.doc_id} ${h.chunk_id}`),
  }))
  const citedIds = new Set<string>()
  const unsupported: string[] = []

  for (const claim of splitClaims(article)) {
    const ct = tokenize(claim)
    if (ct.size < 3) continue
    let support = false
    for (const bag of bags) {
      let overlap = 0
      for (const t of ct) {
        if (bag.tokens.has(t)) overlap += 1
      }
      if (overlap >= 2) {
        citedIds.add(hitId(bag.hit))
        support = true
      }
    }
    if (!support) unsupported.push(claim.slice(0, 220))
  }

  const cited = hits
    .filter((h) => citedIds.has(hitId(h)))
    .map((h) => ({ id: hitId(h), ground: h.ground, title: h.title }))

  return { cited, unsupported }
}

const ARXIV = /\b(?:arxiv:)?(\d{4}\.\d{4,5})(?:v\d+)?\b/gi
const AT_CITE = /\[@([a-z0-9][\w.-]+)\]/gi

export function namedRefs(query: string): string[] {
  const found = new Set<string>()
  for (const m of query.matchAll(ARXIV)) found.add(m[1])
  for (const m of query.matchAll(AT_CITE)) found.add(m[1])
  return [...found]
}

export function notInDbHint(query: string, hits: SearchHit[]): string | null {
  const papers = listPapers()
  const catalog = new Set(papers.flatMap((p) => [p.id.toLowerCase(), (p.arxiv || '').toLowerCase()].filter(Boolean)))
  const missing: string[] = []
  for (const ref of namedRefs(query)) {
    const key = ref.toLowerCase()
    const inCatalog = [...catalog].some((id) => id.includes(key) || key.includes(id))
    const inHits = hits.some((h) =>
      `${h.doc_id} ${h.chunk_id} ${h.title}`.toLowerCase().includes(key),
    )
    if (!inCatalog && !inHits) missing.push(ref)
  }
  if (missing.length) {
    return `Not in DB: ${missing.join(', ')}. POST /api/papers/fetch — do not invent.`
  }
  const paperHits = hits.filter((h) => h.ground === 'papers')
  if (!paperHits.length && /paper|arxiv|doi|cite/i.test(query)) {
    return 'No papers-ground hits. POST /api/papers/fetch if the work is OA and missing — do not invent.'
  }
  return null
}

export function citeOrFetchEnvelope(hits: SearchHit[], query: string): CiteOrFetch {
  return {
    mustCite: true,
    hits,
    notInDb: notInDbHint(query, hits),
    fetch: 'POST /api/papers/fetch',
  }
}

export function citationIds(hits: SearchHit[]): string[] {
  return [...new Set(hits.map((h) => h.doc_id || h.chunk_id).filter(Boolean))]
}
