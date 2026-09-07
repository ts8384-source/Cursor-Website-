import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir } from '../paths.ts'

/** Lab-bench trash only. Encyclopedia / papers never decay. */
export const TRASH_TTL_MS = 14 * 24 * 60 * 60 * 1000

export type TrashItem = {
  slug: string
  id: string
  title: string
  href: string
  trashedAt: string
  forgottenAt: string
  forgotten: boolean
  note: string
  restoredAt?: string
}

type TrashFile = { ttlDays: number; items: TrashItem[] }

const PROTECTED = new Set(['sandbox'])

function trashFile() {
  const dir = join(dataDir, 'sandbox')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'trash.json')
}

function readRaw(): TrashItem[] {
  const file = trashFile()
  if (!existsSync(file)) return []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as TrashFile
    return Array.isArray(parsed.items) ? parsed.items : []
  } catch {
    return []
  }
}

function writeRaw(items: TrashItem[]) {
  writeFileSync(trashFile(), `${JSON.stringify({ ttlDays: 14, items }, null, 2)}\n`, 'utf8')
}

export function forgottenAtFrom(trashedAt: string, now = Date.now()) {
  const start = Date.parse(trashedAt)
  const base = Number.isFinite(start) ? start : now
  return new Date(base + TRASH_TTL_MS).toISOString()
}

/** Mark 14-day-old trash as forgotten. Does not delete MD, papers, or encyclopedia. */
export function sweepSandboxTrash(now = Date.now()): TrashItem[] {
  const items = readRaw().map((row) => {
    if (row.forgotten || row.restoredAt) return row
    const due = Date.parse(row.forgottenAt)
    if (Number.isFinite(due) && now >= due) {
      return { ...row, forgotten: true }
    }
    return row
  })
  writeRaw(items.filter((row) => !row.restoredAt))
  return items.filter((row) => !row.restoredAt)
}

export function listSandboxTrash(opts: { forgotten?: boolean } = {}) {
  const items = sweepSandboxTrash()
  const includeForgotten = opts.forgotten === true
  const live = items.filter((row) => (includeForgotten ? true : !row.forgotten))
  return {
    ok: true as const,
    meaning: 'Lab-bench trash only. After 14 days forgotten = drop from live lab tree / agent pickup. Not article decay.',
    ttlDays: 14,
    items: live,
    forgotten: items.filter((row) => row.forgotten),
    slugs: live.filter((row) => !row.forgotten).map((row) => row.slug),
    count: live.filter((row) => !row.forgotten).length,
  }
}

export function trashState(slug: string, now = Date.now()): 'live' | 'trashed' | 'forgotten' {
  const row = sweepSandboxTrash(now).find((item) => item.slug === slug)
  if (!row) return 'live'
  if (row.forgotten) return 'forgotten'
  return 'trashed'
}

/** Hidden from live lab nest / lanes / agent pickup. */
export function isHiddenFromLab(slug: string, sandbox: boolean): boolean {
  if (!sandbox) return false
  const state = trashState(slug)
  return state === 'trashed' || state === 'forgotten'
}

export function putSandboxTrash(input: { slug: string; id: string; title: string; note?: string }) {
  const slug = input.slug.trim().toLowerCase()
  if (!slug) throw new Error('slug required')
  if (PROTECTED.has(slug)) throw new Error('cannot trash the Lab bench parent')
  const now = new Date().toISOString()
  const items = sweepSandboxTrash().filter((row) => row.slug !== slug)
  const row: TrashItem = {
    slug,
    id: input.id,
    title: input.title,
    href: `/site/${slug}`,
    trashedAt: now,
    forgottenAt: forgottenAtFrom(now),
    forgotten: false,
    note: (input.note ?? '').trim(),
  }
  items.unshift(row)
  writeRaw(items)
  return { ok: true as const, item: row, ...listSandboxTrash() }
}

export function restoreSandboxTrash(slugRaw: string) {
  const slug = slugRaw.trim().toLowerCase()
  if (!slug) throw new Error('slug required')
  const items = sweepSandboxTrash()
  const row = items.find((item) => item.slug === slug)
  if (!row) throw new Error(`not in trash: ${slug}`)
  if (row.forgotten) throw new Error('forgotten after 14 days — not restored by this hook')
  const now = new Date().toISOString()
  writeRaw(items.filter((item) => item.slug !== slug))
  return {
    ok: true as const,
    restored: { ...row, restoredAt: now },
    href: `/site/${slug}`,
    ...listSandboxTrash(),
  }
}
