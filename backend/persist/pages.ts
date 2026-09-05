import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { mdDir, root } from '../paths.ts'

export type GlossaryEntry = { term: string; def: string }

export type PageMeta = {
  slug: string
  title: string
  nav: string
  order: number
  gist: string
  questions: string[]
  glossary: GlossaryEntry[]
  citations: string[]
  path: string
  scrolly: boolean
}

export type PageDoc = PageMeta & { markdown: string; body: string }

type Fm = Record<string, unknown>

const SKIP = new Set(['architecture.md'])

function parseScalar(raw: string): unknown {
  const t = raw.trim()
  if (t === 'true') return true
  if (t === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
  return t.replace(/^["']|["']$/g, '')
}

/** Minimal YAML frontmatter. Lists are either inline or `-` blocks. */
export function parseFrontmatter(raw: string): { data: Fm; body: string } {
  const text = raw.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n')
  if (!text.startsWith('---\n')) return { data: {}, body: text }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) return { data: {}, body: text }
  const yaml = text.slice(4, end)
  const body = text.slice(end + 5)
  const data: Fm = {}
  let key = ''
  let list: unknown[] | null = null
  let obj: Record<string, string> | null = null

  const flushObj = () => {
    if (obj && list) list.push(obj)
    obj = null
  }

  for (const line of yaml.split('\n')) {
    if (/^\s+-\s+term:/.test(line) && key) {
      flushObj()
      obj = { term: String(parseScalar(line.replace(/^\s+-\s+term:\s*/, ''))) }
      if (!Array.isArray(data[key])) data[key] = []
      list = data[key] as unknown[]
      continue
    }
    if (obj && /^\s{2,}def:/.test(line)) {
      obj.def = String(parseScalar(line.replace(/^\s+def:\s*/, '')))
      continue
    }
    if (/^\s+-\s+/.test(line) && key) {
      flushObj()
      if (!Array.isArray(data[key])) data[key] = []
      list = data[key] as unknown[]
      list.push(parseScalar(line.replace(/^\s+-\s+/, '')))
      continue
    }
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (m) {
      flushObj()
      key = m[1]
      list = null
      if (m[2] === '') {
        data[key] = []
        list = data[key] as unknown[]
      } else {
        data[key] = parseScalar(m[2])
      }
    }
  }
  flushObj()
  return { data, body }
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v) => typeof v === 'string') as string[]
}

function asGlossary(value: unknown): GlossaryEntry[] {
  if (!Array.isArray(value)) return []
  const out: GlossaryEntry[] = []
  for (const item of value) {
    if (item && typeof item === 'object' && 'term' in item && 'def' in item) {
      const row = item as { term: unknown; def: unknown }
      out.push({ term: String(row.term), def: String(row.def) })
    }
  }
  return out
}

function toMeta(rel: string, data: Fm): PageMeta {
  const fileSlug = basename(rel, '.md').toLowerCase()
  const slug = String(data.slug ?? fileSlug)
  const title = String(data.title ?? slug)
  return {
    slug,
    title,
    nav: String(data.nav ?? title),
    order: typeof data.order === 'number' ? data.order : 50,
    gist: String(data.gist ?? ''),
    questions: asStringList(data.questions),
    glossary: asGlossary(data.glossary),
    citations: asStringList(data.citations),
    path: rel,
    scrolly: data.scrolly === true,
  }
}

function pageRoots() {
  return [
    { dir: mdDir, prefix: 'data/md' },
    { dir: join(root, 'content'), prefix: 'content' },
  ]
}

function walkMd(dir: string, prefix: string, acc: { rel: string; abs: string }[]) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    const rel = `${prefix}/${name}`.replaceAll('\\', '/')
    if (statSync(abs).isDirectory()) {
      if (name === 'pdf') continue
      walkMd(abs, rel, acc)
      continue
    }
    if (!name.endsWith('.md')) continue
    if (SKIP.has(name.toLowerCase())) continue
    acc.push({ rel, abs })
  }
}

export function listPages(): PageMeta[] {
  const files: { rel: string; abs: string }[] = []
  for (const rootDir of pageRoots()) walkMd(rootDir.dir, rootDir.prefix, files)
  const pages: PageMeta[] = []
  for (const file of files) {
    const raw = readFileSync(file.abs, 'utf8')
    const { data } = parseFrontmatter(raw)
    if (!data.title && !data.slug) continue
    pages.push(toMeta(file.rel, data))
  }
  pages.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
  return pages
}

export function loadPage(slug: string): PageDoc | null {
  const files: { rel: string; abs: string }[] = []
  for (const rootDir of pageRoots()) walkMd(rootDir.dir, rootDir.prefix, files)
  for (const file of files) {
    const raw = readFileSync(file.abs, 'utf8')
    const { data, body } = parseFrontmatter(raw)
    const meta = toMeta(file.rel, data)
    if (meta.slug !== slug) continue
    if (!data.title && !data.slug) continue
    return { ...meta, markdown: raw, body }
  }
  return null
}
