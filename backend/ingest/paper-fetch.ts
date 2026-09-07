import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { papersDir } from '../paths.ts'
import { listPapers } from '../persist/papers-catalog.ts'
import { runRag } from '../scripts/runner.ts'
import {
  MAX_MD_CHARS,
  arxivAbsUrl,
  arxivApiUrl,
  arxivPdfUrl,
  extractPdfStrings,
  isArxivHost,
  parseArxivId,
  parseHttpUrl,
  safeGet,
} from './fetch-safe.ts'

export type FetchRequest = {
  url?: string
  arxiv?: string
  id?: string
}

export type FetchOk = {
  ok: true
  skipped?: boolean
  id: string
  title: string
  path: string
  pdf: string | null
  bytes: number
  source: string
  ingested: boolean
  seed?: unknown
  rebuild?: unknown
}

function slugFromArxiv(arxiv: string) {
  return `arxiv-${arxiv.replace(/[.]/g, '-')}`
}

function xmlText(xml: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  return (re.exec(xml)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function parseArxivAtom(xml: string) {
  const entry = /<entry[\s\S]*?<\/entry>/i.exec(xml)?.[0] ?? xml
  const title = xmlText(entry, 'title')
  const summary = xmlText(entry, 'summary')
  const published = xmlText(entry, 'published')
  const year = published.slice(0, 4)
  const authors = [...entry.matchAll(/<name>([^<]+)<\/name>/gi)].map((m) => m[1].trim()).join(', ')
  return { title: title.replace(/^arxiv:\S+\s*/i, '').trim(), summary, year, authors }
}

function existingMatch(arxiv: string | null, url: string | null) {
  const papers = listPapers()
  return papers.find((p) => {
    if (arxiv && (p.arxiv === arxiv || p.id === slugFromArxiv(arxiv) || p.id === arxiv)) return true
    if (url && (p.oa_url === url || p.oa_url.replace(/\.pdf$/i, '') === url.replace(/\.pdf$/i, ''))) return true
    return false
  })
}

function writeCatalogLine(id: string, title: string) {
  const catalog = join(papersDir, 'CATALOG.md')
  if (!existsSync(catalog)) return
  const text = readFileSync(catalog, 'utf8')
  if (text.includes(id)) return
  writeFileSync(catalog, `${text.trimEnd()}\n- ${id} — ${title} (on-demand fetch)\n`, 'utf8')
}

function paperMarkdown(rec: {
  id: string
  title: string
  authors: string
  year: string
  venue: string
  oa_url: string
  arxiv: string
  local_pdf: string
  body: string
}) {
  const text = `# ${rec.title}

- **id:** ${rec.id}
- **list:** fetched
- **authors:** ${rec.authors || 'unknown'}
- **year:** ${rec.year || ''}
- **venue:** ${rec.venue}
- **oa_url:** ${rec.oa_url}
- **arxiv:** ${rec.arxiv || 'n/a'}
- **local_pdf:** ${rec.local_pdf || 'n/a'}

## Extracted text (local RAG ingest)

${rec.body.trim()}
`
  return text.length > MAX_MD_CHARS ? text.slice(0, MAX_MD_CHARS) : text
}

async function ingestPapersGround() {
  const seed = await runRag(['seed'], 180_000)
  if (!seed.ok) {
    return { ok: false as const, seed, rebuild: undefined, error: seed.error, hint: seed.hint }
  }
  const rebuild = await runRag(['rebuild', '--grounds', 'papers'], 240_000)
  if (!rebuild.ok) {
    return { ok: false as const, seed: seed.data, rebuild, error: rebuild.error, hint: rebuild.hint }
  }
  return { ok: true as const, seed: seed.data, rebuild: rebuild.data }
}

export async function fetchAndIngestPaper(input: FetchRequest): Promise<FetchOk> {
  const raw = (input.arxiv || input.id || input.url || '').trim()
  if (!raw) throw new Error('arxiv id or OA url required')

  const arxiv = parseArxivId(raw) || parseArxivId(input.url || '')
  let sourceUrl = ''
  if (arxiv) {
    sourceUrl = arxivPdfUrl(arxiv)
  } else {
    const url = parseHttpUrl(raw)
    if (isArxivHost(url.hostname)) {
      const id = parseArxivId(url.href)
      if (id) sourceUrl = arxivPdfUrl(id)
    }
    if (!sourceUrl) {
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('only http(s)')
      sourceUrl = url.href
    }
  }

  const arxivId = arxiv || parseArxivId(sourceUrl)
  const hit = existingMatch(arxivId, sourceUrl)
  if (hit) {
    const pdfGuess = `data/papers/pdf/${hit.id}.pdf`
    return {
      ok: true,
      skipped: true,
      id: hit.id,
      title: hit.title,
      path: hit.file,
      pdf: existsSync(join(papersDir, 'pdf', `${hit.id}.pdf`)) ? pdfGuess : null,
      bytes: 0,
      source: hit.oa_url || sourceUrl,
      ingested: true,
    }
  }

  let meta = {
    title: arxivId || 'Fetched paper',
    authors: '',
    year: '',
    summary: '',
    venue: arxivId ? 'arXiv preprint' : 'OA PDF',
  }
  if (arxivId) {
    try {
      const atom = await safeGet(arxivApiUrl(arxivId), 2_000_000)
      meta = { ...meta, ...parseArxivAtom(atom.body.toString('utf8')), venue: 'arXiv preprint' }
    } catch {
      /* PDF path still required */
    }
  }

  const got = await safeGet(sourceUrl)
  const isPdf =
    got.contentType.includes('pdf') ||
    got.body.subarray(0, 5).toString('utf8') === '%PDF-' ||
    /\.pdf(\?|$)/i.test(got.url)
  if (!isPdf && !arxivId) {
    throw new Error('not an OA PDF (use an arXiv id or a direct PDF URL)')
  }
  if (!isArxivHost(new URL(got.url).hostname) && !isPdf) {
    throw new Error('blocked non-OA HTML')
  }

  const id = arxivId ? slugFromArxiv(arxivId) : `fetch-${Date.now().toString(36)}`
  const pdfRel = isPdf ? `pdf/${id}.pdf` : ''
  if (isPdf) {
    mkdirSync(join(papersDir, 'pdf'), { recursive: true })
    writeFileSync(join(papersDir, 'pdf', `${id}.pdf`), got.body)
  }

  const extracted = isPdf ? extractPdfStrings(got.body) : ''
  const body =
    [meta.summary && `Abstract. ${meta.summary}`, extracted].filter(Boolean).join('\n\n') ||
    meta.title

  const rec = {
    id,
    title: meta.title || id,
    authors: meta.authors,
    year: meta.year,
    venue: meta.venue,
    oa_url: arxivId ? arxivAbsUrl(arxivId) : got.url,
    arxiv: arxivId || 'n/a',
    local_pdf: pdfRel || 'n/a',
    body,
  }
  const md = paperMarkdown(rec)
  const dest = join(papersDir, `${id}.md`)
  writeFileSync(dest, md, 'utf8')
  writeCatalogLine(id, rec.title)

  const indexed = await ingestPapersGround()
  if (!indexed.ok) {
    const err = new Error(indexed.error || 'paper saved but index rebuild failed')
    ;(err as Error & { hint?: string; path?: string }).hint = indexed.hint
    ;(err as Error & { path?: string }).path = `data/papers/${id}.md`
    throw err
  }

  return {
    ok: true,
    id,
    title: rec.title,
    path: `data/papers/${id}.md`,
    pdf: pdfRel ? `data/papers/${pdfRel}` : null,
    bytes: got.body.length,
    source: rec.oa_url,
    ingested: true,
    seed: indexed.seed,
    rebuild: indexed.rebuild,
  }
}
