import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { docsDir, mdDir, root } from '../paths.ts'
import { docsPresent } from './docs.ts'
import { resolveHighlight, type HighlightRole } from './highlights.ts'
import { isHiddenFromLab } from './sandbox-trash.ts'

export type GlossaryEntry = { term: string; def: string }

export type PageDepth = 'short' | 'standard' | 'long'

export type SandboxLane = 'idea' | 'code' | 'research'

const SANDBOX_LANES = new Set<SandboxLane>(['idea', 'code', 'research'])

export type PageBin = 'boot' | 'doc'

export function pageHref(bin: PageBin, slug: string) {
  return bin === 'doc' ? `/docs/${slug}` : `/site/${slug}`
}

export type PageMeta = {
  id: string
  slug: string
  title: string
  nav: string
  order: number
  gist: string
  questions: string[]
  glossary: GlossaryEntry[]
  citations: string[]
  tags: string[]
  related: string[]
  /**
   * Live widgets this page mounts, by registry name (`diagrams:wiki-memory`, `papers`).
   * The page declares what it shows; the frontend registry only knows how to draw each one.
   */
  embeds: string[]
  summaryShort: string
  summaryLong: string
  /** Authoring length. Missing YAML defaults to standard — not a rewrite of old pages. */
  depth: PageDepth
  /** Target body words. 0 = use the depth default (short 120, standard 350, long 700). */
  pageBudget: number
  /** Disposable lab article. Stays out of Overview / left TOC until promote. */
  sandbox: boolean
  sandboxLane: SandboxLane | ''
  /** Main page id this note is attached to (`page:wiki-writing`). */
  sandboxFor: string
  updated: string
  path: string
  scrolly: boolean
  hidden: boolean
  /** Page id of the parent (`page:agents`). Empty string = root. */
  parent: string
  /**
   * Keep this child on its own route instead of folding it into the parent topic page.
   * For appendix-style material — a single-paper study, an experiment log — that would
   * bloat the topic. Default false: children read as sections of their topic.
   */
  subpage: boolean
  /** Child page ids, derived from `parent` (hidden children omitted). */
  children: string[]
  /** Fork-ready chrome: start = Overview map, queue = To-implement, lab = Sandbox nest. */
  highlight: HighlightRole | ''
  /** Later project id (`dashboard`). Empty = this framework. */
  project: string
  /** boot = user wiki (`data/md`). doc = framework explain (`data/docs` + CONTROL). */
  bin: PageBin
  href: string
}

export type PageTreeNode = {
  id: string
  slug: string
  nav: string
  title: string
  gist: string
  highlight: HighlightRole | ''
  href: string
  bin: PageBin
  children: PageTreeNode[]
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

function asDepth(value: unknown): PageDepth {
  const t = String(value ?? '').toLowerCase()
  if (t === 'short' || t === 'standard' || t === 'long') return t
  return 'standard'
}

function asBudget(value: unknown): number {
  return typeof value === 'number' && value > 0 ? Math.floor(value) : 0
}

function asLane(value: unknown): SandboxLane | '' {
  const t = String(value ?? '').toLowerCase()
  return SANDBOX_LANES.has(t as SandboxLane) ? (t as SandboxLane) : ''
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

function toMeta(rel: string, data: Fm, bin: PageBin): PageMeta {
  const fileSlug = basename(rel, '.md').toLowerCase()
  const slug = String(data.slug ?? fileSlug)
  const title = String(data.title ?? slug)
  const gist = String(data.gist ?? '')
  return {
    id: String(data.id ?? `page:${slug}`),
    slug,
    title,
    nav: String(data.nav ?? title),
    order: typeof data.order === 'number' ? data.order : 50,
    gist,
    questions: asStringList(data.questions),
    glossary: asGlossary(data.glossary),
    citations: asStringList(data.citations),
    tags: asStringList(data.tags),
    related: asStringList(data.related),
    embeds: asStringList(data.embeds),
    summaryShort: String(data.summaryShort ?? ''),
    summaryLong: String(data.summaryLong ?? ''),
    depth: asDepth(data.depth),
    pageBudget: asBudget(data.pageBudget),
    sandbox: data.sandbox === true || (bin === 'boot' && rel.replaceAll('\\', '/').includes('/sandbox/')),
    sandboxLane: asLane(data.sandboxLane),
    sandboxFor: data.sandboxFor != null && data.sandboxFor !== '' ? String(data.sandboxFor) : '',
    updated: String(data.updated ?? ''),
    path: rel,
    scrolly: data.scrolly === true,
    hidden: data.hidden === true || data.nav === false,
    parent: data.parent != null && data.parent !== '' ? String(data.parent) : '',
    subpage: data.subpage === true,
    children: [],
    highlight: resolveHighlight(slug, data.highlight),
    project: data.project != null && data.project !== '' ? String(data.project).replace(/^project:/, '') : '',
    bin,
    href: pageHref(bin, slug),
  }
}

function resolveParentId(raw: string, byId: Map<string, PageMeta>, bySlug: Map<string, PageMeta>): string {
  const t = raw.trim()
  if (!t) return ''
  if (byId.has(t)) return t
  const slug = t.replace(/^page:/, '')
  return bySlug.get(slug)?.id ?? ''
}

/** One nest source: child frontmatter `parent`. Fills `children` on parents. */
export function attachNest(pages: PageMeta[]): PageMeta[] {
  const byId = new Map(pages.map((p) => [p.id, p]))
  const bySlug = new Map(pages.map((p) => [p.slug, p]))
  for (const page of pages) {
    page.children = []
    page.parent = resolveParentId(page.parent, byId, bySlug)
  }
  for (const page of pages) {
    const seen = new Set<string>()
    let cur = page.parent
    while (cur) {
      if (cur === page.id || seen.has(cur)) {
        page.parent = ''
        break
      }
      seen.add(cur)
      cur = byId.get(cur)?.parent ?? ''
    }
  }
  for (const page of pages) {
    if (!page.parent || page.hidden) continue
    const parent = byId.get(page.parent)
    if (!parent || parent.hidden) {
      page.parent = ''
      continue
    }
    if (page.bin !== parent.bin) continue
    if (page.sandbox !== parent.sandbox && !(parent.id === 'page:sandbox' && page.sandbox)) continue
    parent.children.push(page.id)
  }
  for (const page of pages) {
    page.children.sort((a, b) => {
      const pa = byId.get(a)
      const pb = byId.get(b)
      if (!pa || !pb) return a.localeCompare(b)
      return pa.order - pb.order || pa.slug.localeCompare(pb.slug)
    })
  }
  return pages
}

/** Visible IA tree. Hidden pages stay out. Same payload sidebar and Overview use. */
export function pageTree(pages: PageMeta[]): PageTreeNode[] {
  const byId = new Map(pages.map((p) => [p.id, p]))
  const toNode = (page: PageMeta): PageTreeNode => ({
    id: page.id,
    slug: page.slug,
    nav: page.nav,
    title: page.title,
    gist: page.gist,
    highlight: page.highlight,
    href: page.href,
    bin: page.bin,
    children: page.children
      .map((id) => byId.get(id))
      .filter((child): child is PageMeta => {
        if (!child || child.hidden) return false
        if (!child.sandbox) return true
        return page.id === 'page:sandbox' || page.sandbox
      })
      .map(toNode),
  })
  return pages.filter((p) => !p.hidden && !p.sandbox && !p.parent).map(toNode)
}

export type SandboxGroup = {
  idea: PageMeta[]
  code: PageMeta[]
  research: PageMeta[]
}

/** Wiki lab pages. Not the Overview tree. */
export function groupSandboxPages(pages: PageMeta[]): SandboxGroup {
  const out: SandboxGroup = { idea: [], code: [], research: [] }
  for (const page of pages) {
    if (!page.sandbox || page.hidden || !page.sandboxLane) continue
    out[page.sandboxLane].push(page)
  }
  for (const lane of SANDBOX_LANES) {
    out[lane].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
  }
  return out
}

type PageFile = { rel: string; abs: string; bin: PageBin }

function pageRoots(): { dir: string; prefix: string; bin: PageBin }[] {
  const roots: { dir: string; prefix: string; bin: PageBin }[] = [{ dir: mdDir, prefix: 'data/md', bin: 'boot' }]
  if (docsPresent()) roots.push({ dir: docsDir, prefix: 'data/docs', bin: 'doc' })
  return roots
}

function walkMd(dir: string, prefix: string, bin: PageBin, acc: PageFile[]) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    const rel = `${prefix}/${name}`.replaceAll('\\', '/')
    if (statSync(abs).isDirectory()) {
      if (name === 'pdf') continue
      walkMd(abs, rel, bin, acc)
      continue
    }
    if (!name.endsWith('.md')) continue
    if (SKIP.has(name.toLowerCase())) continue
    if (name.toLowerCase() === 'readme.md') continue
    acc.push({ rel, abs, bin })
  }
}

function collectPageFiles(): PageFile[] {
  const files: PageFile[] = []
  for (const rootDir of pageRoots()) walkMd(rootDir.dir, rootDir.prefix, rootDir.bin, files)
  if (docsPresent()) {
    const abs = join(root, 'content', 'CONTROL.md')
    if (existsSync(abs)) files.push({ rel: 'content/CONTROL.md', abs, bin: 'doc' })
  }
  return files
}

export function listPages(): PageMeta[] {
  const pages: PageMeta[] = []
  for (const file of collectPageFiles()) {
    const raw = readFileSync(file.abs, 'utf8')
    const { data } = parseFrontmatter(raw)
    if (!data.title && !data.slug) continue
    const meta = toMeta(file.rel, data, file.bin)
    if (isHiddenFromLab(meta.slug, meta.sandbox)) meta.hidden = true
    pages.push(meta)
  }
  pages.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
  return attachNest(pages)
}

export function pagesForBin(pages: PageMeta[], bin: PageBin): PageMeta[] {
  return pages.filter((p) => p.bin === bin)
}

export function pagesForProject(pages: PageMeta[], project: string): PageMeta[] {
  const key = project.trim().replace(/^project:/, '').toLowerCase()
  if (!key) return pages
  return pages.filter((p) => p.project.toLowerCase() === key)
}

export function loadPage(slug: string): PageDoc | null {
  for (const file of collectPageFiles()) {
    const raw = readFileSync(file.abs, 'utf8')
    const { data, body } = parseFrontmatter(raw)
    const meta = toMeta(file.rel, data, file.bin)
    if (meta.slug !== slug) continue
    if (!data.title && !data.slug) continue
    const listed = listPages().find((p) => p.slug === slug)
    return { ...(listed ?? meta), markdown: raw, body }
  }
  return null
}
