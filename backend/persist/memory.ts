import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { memoryDir } from '../paths.ts'
import { bookkeep } from './bookkeep.ts'

export type MemoryLane = 'user' | 'project'

export type MemoryItem = {
  id: string
  lane: MemoryLane
  text: string
  kind: string
  createdAt: string
  lastAccessAt: string
  strength: number
  halfLifeHours: number
  supersedes?: string
  supersededBy?: string
  supersededAt?: string
}

export type MemoryView = MemoryItem & { decayed: number; forgotten: boolean; superseded: boolean }

const THRESHOLD = 0.08

function fileFor(lane: MemoryLane) {
  mkdirSync(memoryDir, { recursive: true })
  return join(memoryDir, `${lane}.jsonl`)
}

function readLane(lane: MemoryLane): MemoryItem[] {
  const file = fileFor(lane)
  if (!existsSync(file)) return []
  const items: MemoryItem[] = []
  for (const line of readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)) {
    try {
      items.push(JSON.parse(line) as MemoryItem)
    } catch {
      // skip
    }
  }
  return items
}

function writeLane(lane: MemoryLane, items: MemoryItem[]) {
  writeFileSync(fileFor(lane), items.map((i) => JSON.stringify(i)).join('\n') + (items.length ? '\n' : ''), 'utf8')
}

export function decayedStrength(item: MemoryItem, now = Date.now()) {
  const hours = Math.max(0, (now - Date.parse(item.lastAccessAt)) / 3_600_000)
  const half = item.halfLifeHours > 0 ? item.halfLifeHours : 72
  return item.strength * 2 ** (-hours / half)
}

export function viewItem(item: MemoryItem, now = Date.now()): MemoryView {
  const decayed = decayedStrength(item, now)
  return { ...item, decayed, forgotten: decayed < THRESHOLD, superseded: Boolean(item.supersededBy) }
}

function seedIfEmpty() {
  if (readLane('project').length) return
  const now = new Date().toISOString()
  const seeds: MemoryItem[] = [
    {
      id: 'proj-core-site',
      lane: 'project',
      text: 'Project core is the website: Markdown pages plus tool ACI, not a 3b1b night-mode wall.',
      kind: 'architecture',
      createdAt: now,
      lastAccessAt: now,
      strength: 1,
      halfLifeHours: 720,
    },
    {
      id: 'proj-paper-db-permanent',
      lane: 'project',
      text: 'Papers are a permanent DB (data/papers + /api/papers/db). Forgetting never applies to papers.',
      kind: 'architecture',
      createdAt: now,
      lastAccessAt: now,
      strength: 1,
      halfLifeHours: 720,
    },
    {
      id: 'proj-code-from-math',
      lane: 'project',
      text: 'Fetch code on demand from math or diagram queries; store bidirectional maps in data/maps.',
      kind: 'architecture',
      createdAt: now,
      lastAccessAt: now,
      strength: 0.95,
      halfLifeHours: 480,
    },
    {
      id: 'proj-forgetting',
      lane: 'project',
      text: 'User and project long-term memory use half-life decay (Ebbinghaus-style). Touch to strengthen.',
      kind: 'architecture',
      createdAt: now,
      lastAccessAt: now,
      strength: 0.9,
      halfLifeHours: 336,
    },
  ]
  writeLane('project', seeds)
  if (!readLane('user').length) {
    writeLane('user', [
      {
        id: 'user-park-literature-code',
        lane: 'user',
        text: 'Parked board: paper diagrams + math-term links + summary MD + code↔math/diagram + forgetting memory.',
        kind: 'park',
        createdAt: now,
        lastAccessAt: now,
        strength: 1,
        halfLifeHours: 96,
      },
    ])
  }
}

export function findMemory(id: string): MemoryItem | null {
  seedIfEmpty()
  for (const lane of ['user', 'project'] as MemoryLane[]) {
    const hit = readLane(lane).find((i) => i.id === id)
    if (hit) return hit
  }
  return null
}

export function listMemory(lane?: MemoryLane, includeForgotten = false, includeSuperseded = false) {
  seedIfEmpty()
  const lanes: MemoryLane[] = lane ? [lane] : ['user', 'project']
  const views = lanes.flatMap((l) => readLane(l).map((item) => viewItem(item)))
  views.sort((a, b) => b.decayed - a.decayed)
  const items = views.filter((v) => {
    if (!includeForgotten && v.forgotten) return false
    if (!includeSuperseded && v.superseded) return false
    return true
  })
  return {
    threshold: THRESHOLD,
    rule: 'Papers and data/md never decay. Forget-lanes only. Superseded items stay on disk.',
    items,
    forgottenCount: views.filter((v) => v.forgotten).length,
    supersededCount: views.filter((v) => v.superseded).length,
  }
}

export function remember(input: {
  lane: MemoryLane
  text: string
  kind?: string
  halfLifeHours?: number
  supersedes?: string
}) {
  seedIfEmpty()
  const now = new Date().toISOString()
  const supersedes = input.supersedes?.trim()
  if (supersedes && !findMemory(supersedes)) {
    throw new Error(`supersedes target not found: ${supersedes}`)
  }
  const item: MemoryItem = {
    id: `mem-${Date.now().toString(36)}`,
    lane: input.lane,
    text: input.text.trim(),
    kind: input.kind?.trim() || 'note',
    createdAt: now,
    lastAccessAt: now,
    strength: 1,
    halfLifeHours: input.halfLifeHours ?? (input.lane === 'project' ? 480 : 72),
    ...(supersedes ? { supersedes } : {}),
  }
  if (supersedes) {
    markSuperseded(supersedes, item.id, now)
  }
  appendFileSync(fileFor(item.lane), `${JSON.stringify(item)}\n`, 'utf8')
  return viewItem(item)
}

function markSuperseded(oldId: string, newId: string, at: string) {
  for (const lane of ['user', 'project'] as MemoryLane[]) {
    const items = readLane(lane)
    const idx = items.findIndex((i) => i.id === oldId)
    if (idx < 0) continue
    items[idx] = { ...items[idx], supersededBy: newId, supersededAt: at }
    writeLane(lane, items)
    return
  }
}

export function touchMemory(id: string) {
  seedIfEmpty()
  for (const lane of ['user', 'project'] as MemoryLane[]) {
    const items = readLane(lane)
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) continue
    const now = new Date().toISOString()
    items[idx] = {
      ...items[idx],
      lastAccessAt: now,
      strength: Math.min(1, items[idx].strength + 0.18),
    }
    writeLane(lane, items)
    return viewItem(items[idx])
  }
  return null
}

export function forgetMemory(id: string, why?: string) {
  seedIfEmpty()
  for (const lane of ['user', 'project'] as MemoryLane[]) {
    const items = readLane(lane)
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) continue
    items[idx] = { ...items[idx], strength: 0, lastAccessAt: new Date().toISOString() }
    writeLane(lane, items)
    const view = viewItem(items[idx])
    const related = [view.lane, view.kind, view.supersedes, view.supersededBy].filter(Boolean)
    bookkeep('AUDIT', {
      who: 'POST /api/memory/forget',
      what: view.id,
      why: why?.trim() || 'force decay to zero on forget-lane',
      related,
      lane: view.lane,
    })
    return view
  }
  return null
}

export function memoryAsHits(query: string, limit = 6) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 1)
  const listed = listMemory(undefined, false, false)
  return listed.items
    .filter((m) => {
      const hay = `${m.id} ${m.text} ${m.kind} ${m.lane}`.toLowerCase()
      return tokens.some((t) => hay.includes(t))
    })
    .slice(0, limit)
    .map((m) => ({
      chunk_id: m.id,
      doc_id: m.id,
      title: `memory ${m.lane}`,
      text: m.text.slice(0, 360),
      score: m.decayed,
      ground: 'memory' as const,
    }))
}
