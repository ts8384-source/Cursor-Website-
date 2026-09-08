import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { papersDir } from '../paths.ts'

/** Which shelf a paper sits on: what built the framework, or what a project needed. */
export type PaperCollection = 'framework' | 'project'

export type PaperRecord = {
  id: string
  title: string
  list: string
  /** Header `collection:`, else derived from `list`. See `collectionOf`. */
  collection: PaperCollection
  authors: string
  year: string
  venue: string
  oa_url: string
  arxiv: string
  file: string
}

/**
 * The framework was built by reading the frontend and backend lists, and everything fetched since
 * belongs to whatever project asked for it. That rule covers every paper already on disk, so an
 * explicit `collection:` header is only needed to overrule it.
 */
const FRAMEWORK_LISTS = new Set(['frontend', 'backend'])

export function collectionOf(explicit: string, list: string): PaperCollection {
  const v = explicit.trim().toLowerCase()
  if (v === 'framework' || v === 'project') return v
  return FRAMEWORK_LISTS.has(list.trim().toLowerCase()) ? 'framework' : 'project'
}

const SKIP = new Set(['catalog.md'])

function field(block: string, key: string) {
  const re = new RegExp(`^\\- \\*\\*${key}:\\*\\*\\s*(.+)$`, 'im')
  return (re.exec(block)?.[1] ?? '').trim()
}

export function parsePaperHeader(text: string, fallbackId: string): PaperRecord | null {
  const head = text.slice(0, 1200)
  const titleLine = /^#\s+(.+)$/m.exec(head)
  if (!titleLine) return null
  const id = field(head, 'id') || fallbackId
  const list = field(head, 'list')
  return {
    id,
    title: titleLine[1].trim(),
    list,
    collection: collectionOf(field(head, 'collection'), list),
    authors: field(head, 'authors'),
    year: field(head, 'year'),
    venue: field(head, 'venue'),
    oa_url: field(head, 'oa_url'),
    arxiv: field(head, 'arxiv'),
    file: '',
  }
}

export function listPapers(): PaperRecord[] {
  if (!existsSync(papersDir)) return []
  const out: PaperRecord[] = []
  for (const name of readdirSync(papersDir)) {
    if (!name.endsWith('.md')) continue
    if (SKIP.has(name.toLowerCase())) continue
    const abs = join(papersDir, name)
    const raw = readFileSync(abs, 'utf8')
    const rec = parsePaperHeader(raw, name.replace(/\.md$/i, ''))
    if (!rec) continue
    rec.file = `data/papers/${name}`
    out.push(rec)
  }
  // 'framework' sorts before 'project', so the shelf that built the tool reads first.
  out.sort(
    (a, b) =>
      a.collection.localeCompare(b.collection) ||
      a.list.localeCompare(b.list) ||
      a.year.localeCompare(b.year) ||
      a.id.localeCompare(b.id),
  )
  return out
}
