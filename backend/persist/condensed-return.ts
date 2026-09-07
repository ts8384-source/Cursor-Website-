import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir } from '../paths.ts'

/** Isolated-subagent packet. Ids + gist. Not a transcript dump. */
export type CondensedId = {
  id: string
  kind?: 'page' | 'paper' | 'chunk' | 'code' | 'diagram' | 'board' | 'memory' | 'other'
}

export type CondensedReturn = {
  id: string
  role?: string
  gist: string
  ids: CondensedId[]
  hrefs?: string[]
  citations?: string[]
  createdAt: string
}

export type CondensedPayload = {
  role?: string
  gist?: string
  ids?: Array<string | CondensedId>
  hrefs?: string[]
  citations?: string[]
}

const MAX_KEEP = 24
const MAX_GIST = 720

function filePath() {
  const dir = join(dataDir, 'sandbox')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'condensed-returns.json')
}

function readStore(): CondensedReturn[] {
  const file = filePath()
  if (!existsSync(file)) return []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { returns?: unknown[] }
    return (parsed.returns ?? []).filter((row): row is CondensedReturn => {
      if (!row || typeof row !== 'object') return false
      const o = row as CondensedReturn
      return typeof o.id === 'string' && typeof o.gist === 'string' && Array.isArray(o.ids)
    })
  } catch {
    return []
  }
}

function writeStore(rows: CondensedReturn[]) {
  writeFileSync(filePath(), `${JSON.stringify({ returns: rows.slice(0, MAX_KEEP) }, null, 2)}\n`, 'utf8')
}

function normalizeIds(raw: CondensedPayload['ids']): CondensedId[] {
  const out: CondensedId[] = []
  const seen = new Set<string>()
  for (const item of raw ?? []) {
    const id = typeof item === 'string' ? item.trim() : String(item?.id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    const kind = typeof item === 'object' && item?.kind ? item.kind : guessKind(id)
    out.push({ id, kind })
    if (out.length >= 24) break
  }
  return out
}

function guessKind(id: string): CondensedId['kind'] {
  if (id.startsWith('page:')) return 'page'
  if (id.startsWith('papers:') || id.startsWith('arxiv-') || /^[a-z0-9-]+-\d{4}$/.test(id)) return 'paper'
  if (id.startsWith('code:')) return 'code'
  if (id.startsWith('diagram:') || id.startsWith('node:')) return 'diagram'
  if (id.startsWith('board:')) return 'board'
  if (id.includes('chunk') || id.includes(':') && id.includes('-md')) return 'chunk'
  return 'other'
}

export function listCondensedReturns() {
  const returns = readStore()
  return {
    ok: true as const,
    contract: 'ids + 1–3 sentence gist. Not a child transcript.',
    latest: returns[0] ?? null,
    returns,
    count: returns.length,
  }
}

export function recordCondensedReturn(input: CondensedPayload) {
  const gist = (input.gist ?? '').replace(/\s+/g, ' ').trim()
  if (!gist) throw new Error('gist required (1–3 sentences)')
  const ids = normalizeIds(input.ids)
  if (!ids.length) throw new Error('at least one stable id required (page / paper / chunk)')
  const now = new Date().toISOString()
  const row: CondensedReturn = {
    id: `condensed-${now.replace(/[^0-9a-z]/gi, '').slice(0, 18)}`,
    role: (input.role ?? '').trim() || undefined,
    gist: gist.slice(0, MAX_GIST),
    ids,
    hrefs: (input.hrefs ?? []).map((h) => h.trim()).filter(Boolean).slice(0, 12),
    citations: (input.citations ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 24),
    createdAt: now,
  }
  const next = [row, ...readStore().filter((r) => r.id !== row.id)]
  writeStore(next)
  return { ok: true as const, recorded: row, ...listCondensedReturns() }
}
