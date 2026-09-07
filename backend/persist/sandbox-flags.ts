import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir } from '../paths.ts'
import { loadPage } from './pages.ts'
import { trashState } from './sandbox-trash.ts'

/** Interesting-come-back. Not discuss / will-implement / implemented. */
export type SandboxFlag = {
  id: string
  slug: string
  title: string
  href: string
  flagged: true
  note: string
  updatedAt: string
}

export type FlagPayload = {
  slug?: string
  id?: string
  flagged?: boolean
  note?: string
}

function flagsFile() {
  const dir = join(dataDir, 'sandbox')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'flags.json')
}

function readFlags(): SandboxFlag[] {
  const file = flagsFile()
  if (!existsSync(file)) return []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { flags?: unknown[] }
    return (parsed.flags ?? []).filter((row): row is SandboxFlag => {
      if (!row || typeof row !== 'object') return false
      const o = row as SandboxFlag
      return typeof o.slug === 'string' && o.flagged === true
    })
  } catch {
    return []
  }
}

function writeFlags(flags: SandboxFlag[]) {
  writeFileSync(flagsFile(), `${JSON.stringify({ flags }, null, 2)}\n`, 'utf8')
}

export function resolveFlagKey(input: FlagPayload) {
  const rawSlug = (input.slug ?? '').trim()
  const rawId = (input.id ?? '').trim()
  const slug = (rawSlug || rawId.replace(/^page:/, '')).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) throw new Error('slug or id required')
  return slug
}

export function listSandboxFlags() {
  const flags = readFlags()
    .filter((row) => trashState(row.slug) !== 'forgotten')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return {
    ok: true as const,
    meaning: 'interesting, come back to this — not will-implement',
    flags,
    slugs: flags.map((f) => f.slug),
    count: flags.length,
  }
}

export function setSandboxFlag(input: FlagPayload) {
  const slug = resolveFlagKey(input)
  const page = loadPage(slug)
  if (!page) throw new Error(`page not found: ${slug}`)
  if (!page.sandbox && slug !== 'sandbox') {
    throw new Error('flag only sandbox nest pages')
  }
  const flagged = input.flagged !== false
  const now = new Date().toISOString()
  const next = readFlags().filter((row) => row.slug !== slug)
  if (!flagged) {
    writeFlags(next)
    return {
      ok: true as const,
      flagged: false as const,
      slug,
      id: page.id,
      meaning: 'interesting, come back to this — not will-implement',
      flags: listSandboxFlags().flags,
    }
  }
  const row: SandboxFlag = {
    id: page.id,
    slug,
    title: page.nav || page.title,
    href: `/site/${slug}`,
    flagged: true,
    note: (input.note ?? '').trim(),
    updatedAt: now,
  }
  next.unshift(row)
  writeFlags(next)
  return {
    ok: true as const,
    flagged: true as const,
    slug,
    id: page.id,
    note: row.note,
    meaning: 'interesting, come back to this — not will-implement',
    flags: listSandboxFlags().flags,
  }
}
