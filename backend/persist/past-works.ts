import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, normalize, relative, sep } from 'node:path'
import { pastWorksDir } from '../paths.ts'

export type PastWorkRecord = {
  id: string
  title: string
  kind: string
  path: string
  bytes: number
  source: string
  updated: string
}

function readJson<T>(name: string, fallback: T): T {
  const abs = join(pastWorksDir, name)
  if (!existsSync(abs)) return fallback
  return JSON.parse(readFileSync(abs, 'utf8')) as T
}

export function pastWorksCatalog(): PastWorkRecord[] {
  const raw = readJson<PastWorkRecord[] | { items?: PastWorkRecord[] }>('catalog.json', [])
  return Array.isArray(raw) ? raw : raw.items ?? []
}

export function pastWorksFacts() {
  return readJson('facts/facts.json', { facts: [], ground: 'past-works' })
}

export function dialectTree() {
  return readJson('dialect-tree/tree.json', { branches: [] })
}

export function pastWorksStatus() {
  const catalog = pastWorksCatalog()
  const byKind: Record<string, number> = {}
  for (const row of catalog) byKind[row.kind] = (byKind[row.kind] ?? 0) + 1
  let files = 0
  const walk = (dir: string) => {
    if (!existsSync(dir)) return
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name)
      if (statSync(abs).isDirectory()) walk(abs)
      else files += 1
    }
  }
  walk(pastWorksDir)
  return {
    dir: 'data/past-works',
    files,
    catalog: catalog.length,
    kinds: byKind,
    facts: (pastWorksFacts() as { facts?: unknown[] }).facts?.length ?? 0,
    // Where a fork surfaces its archive. A project pointer is config, not framework code.
    href: process.env.PAST_WORKS_HREF || '/site/overview',
  }
}

function resolvePastWork(rel: string) {
  const cleaned = rel.replace(/\\/g, '/').replace(/^\/+/, '')
  const abs = normalize(join(pastWorksDir, cleaned))
  const root = normalize(pastWorksDir)
  const relToRoot = relative(root, abs)
  if (!relToRoot || relToRoot.startsWith('..') || relToRoot.split(sep).includes('..')) return null
  if (!existsSync(abs) || !statSync(abs).isFile()) return null
  if (extname(abs).toLowerCase() !== '.md' && extname(abs).toLowerCase() !== '.json') return null
  return { abs, path: cleaned }
}

export function readPastWorkFile(rel: string) {
  const hit = resolvePastWork(rel)
  if (!hit) return null
  return { path: hit.path, text: readFileSync(hit.abs, 'utf8') }
}
