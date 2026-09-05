import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { papersDir } from '../paths.ts'

export type PaperRecord = {
  id: string
  title: string
  list: string
  authors: string
  year: string
  venue: string
  oa_url: string
  arxiv: string
  file: string
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
  return {
    id,
    title: titleLine[1].trim(),
    list: field(head, 'list'),
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
  out.sort((a, b) => a.list.localeCompare(b.list) || a.year.localeCompare(b.year) || a.id.localeCompare(b.id))
  return out
}
