import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { implementDir } from '../paths.ts'

/** Wiki status vocab. Never “production.” */
export type ImplementStatus = 'discuss' | 'will-implement' | 'implemented'

export type ImplementItem = {
  id: string
  title: string
  note: string
  status: ImplementStatus
  related: string[]
  createdAt: string
  updatedAt: string
  implementedAt?: string
  supersedes?: string
  supersededBy?: string
}

export type ImplementView = ImplementItem & { archived: boolean }

const STATUSES = new Set<ImplementStatus>(['discuss', 'will-implement', 'implemented'])

function filePath() {
  mkdirSync(implementDir, { recursive: true })
  return join(implementDir, 'queue.json')
}

function seedItems(now: string): ImplementItem[] {
  return [
    {
      id: 'impl-mgm-ondemand',
      title: 'MGM on-demand bouncer',
      note: 'Hire hook shipped: POST /api/tripwires/hire. User starts the call; ask the operator if stuck. No Mendel Gödel Machine evolution. Never production.',
      status: 'implemented',
      related: ['page:workbench-mgm', 'page:agents-coding-debug', 'page:workbench-round3'],
      createdAt: now,
      updatedAt: now,
      implementedAt: now,
    },
    {
      id: 'impl-sandbox-fork-lab',
      title: 'Sandbox as fork / lab',
      note: 'Shipped: POST /api/sandbox/fork + GET /api/sandbox + propose (human check, no auto-merge). Worktree/branch from main. No Docker headline.',
      status: 'implemented',
      related: ['page:workbench-sandbox', 'page:agents-coding-generate', 'page:workbench-round3'],
      createdAt: now,
      updatedAt: now,
      implementedAt: now,
    },
    {
      id: 'impl-tracecoder-understand',
      title: 'TraceCoder — abandoned',
      note: 'We looked (arxiv-2602-06875). We dropped it. Not a method we use. Do not stand up their multi-agent runtime.',
      status: 'implemented',
      related: ['page:workbench-runtimes', 'arxiv-2602-06875'],
      createdAt: now,
      updatedAt: now,
      implementedAt: now,
    },
    {
      id: 'impl-sandbox-site-lanes',
      title: 'Website sandbox lanes (first slice)',
      note: 'Shipped: data/md/sandbox/ idea|code|research, Sandbox block on /site, POST /api/sandbox/promote copies MD after “promote to main”. Git lab merge still not built.',
      status: 'implemented',
      related: ['page:wiki-writing', 'page:sandbox'],
      createdAt: now,
      updatedAt: now,
      implementedAt: now,
    },
    {
      id: 'impl-context-editing',
      title: 'Context editing + memory tool',
      note: 'Discuss. Anthropic-style context editing named on the memory/token paste. Not decided — do not mark will-implement.',
      status: 'discuss',
      related: ['page:future', 'page:memory'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'impl-sandbox-git-merge',
      title: 'Git lab merge into main',
      note: 'Discuss. POST /api/sandbox/propose still does not merge. Promote copies wiki MD only. Do not add auto-merge. Owner of Judgment.',
      status: 'discuss',
      related: ['page:workbench-sandbox', 'page:implement'],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function normalize(raw: unknown): ImplementItem | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || !o.id.trim()) return null
  if (typeof o.title !== 'string' || !o.title.trim()) return null
  const status = o.status
  if (status !== 'discuss' && status !== 'will-implement' && status !== 'implemented') return null
  return {
    id: o.id,
    title: o.title.trim(),
    note: typeof o.note === 'string' ? o.note : '',
    status,
    related: Array.isArray(o.related) ? o.related.filter((x): x is string => typeof x === 'string') : [],
    createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : new Date().toISOString(),
    implementedAt: typeof o.implementedAt === 'string' ? o.implementedAt : undefined,
    supersedes: typeof o.supersedes === 'string' ? o.supersedes : undefined,
    supersededBy: typeof o.supersededBy === 'string' ? o.supersededBy : undefined,
  }
}

function mergeSeeds(items: ImplementItem[]): { items: ImplementItem[]; wrote: boolean } {
  const have = new Set(items.map((i) => i.id))
  const now = new Date().toISOString()
  let wrote = false
  for (const seed of seedItems(now)) {
    if (have.has(seed.id)) continue
    items.push(seed)
    wrote = true
  }
  return { items, wrote }
}

function readAll(): ImplementItem[] {
  const file = filePath()
  if (!existsSync(file)) {
    const now = new Date().toISOString()
    const seeds = seedItems(now)
    writeAll(seeds)
    return seeds
  }
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { items?: unknown[] }
    const items = (parsed.items ?? []).map(normalize).filter((x): x is ImplementItem => Boolean(x))
    if (!items.length) {
      const now = new Date().toISOString()
      const seeds = seedItems(now)
      writeAll(seeds)
      return seeds
    }
    const merged = mergeSeeds(items)
    if (merged.wrote) writeAll(merged.items)
    return merged.items
  } catch {
    const now = new Date().toISOString()
    const seeds = seedItems(now)
    writeAll(seeds)
    return seeds
  }
}

function writeAll(items: ImplementItem[]) {
  writeFileSync(filePath(), `${JSON.stringify({ items }, null, 2)}\n`, 'utf8')
}

function view(item: ImplementItem): ImplementView {
  return { ...item, archived: item.status === 'implemented' || Boolean(item.supersededBy) }
}

export function listImplement(includeDone = false) {
  const all = readAll()
  const items = includeDone ? all : all.filter((i) => i.status !== 'implemented' && !i.supersededBy)
  return {
    vocab: { discuss: 'thinking', 'will-implement': 'decided, not built', implemented: 'done; hidden from default list' },
    never: 'production',
    items: items.map(view),
    doneCount: all.filter((i) => i.status === 'implemented' || i.supersededBy).length,
    activeCount: all.filter((i) => i.status !== 'implemented' && !i.supersededBy).length,
  }
}

export function addImplement(input: {
  title: string
  note?: string
  status?: ImplementStatus
  related?: string[]
  supersedes?: string
}) {
  const title = input.title.trim()
  if (!title) throw new Error('title required')
  const status = input.status ?? 'discuss'
  if (!STATUSES.has(status)) throw new Error('status must be discuss, will-implement, or implemented')
  if (status === 'implemented') throw new Error('add as discuss or will-implement; then complete')
  const now = new Date().toISOString()
  const items = readAll()
  const id = `impl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const item: ImplementItem = {
    id,
    title,
    note: input.note?.trim() ?? '',
    status,
    related: input.related ?? [],
    createdAt: now,
    updatedAt: now,
    supersedes: input.supersedes?.trim() || undefined,
  }
  if (item.supersedes) {
    const old = items.find((i) => i.id === item.supersedes)
    if (old) {
      old.supersededBy = id
      old.updatedAt = now
    }
  }
  items.push(item)
  writeAll(items)
  return item
}

export function completeImplement(id: string) {
  const items = readAll()
  const item = items.find((i) => i.id === id)
  if (!item) return null
  const now = new Date().toISOString()
  item.status = 'implemented'
  item.implementedAt = now
  item.updatedAt = now
  writeAll(items)
  return item
}
