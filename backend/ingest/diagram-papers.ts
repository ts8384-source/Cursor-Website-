import { parseArxivId } from './fetch-safe.ts'
import { fetchAndIngestPaper } from './paper-fetch.ts'
import type { DiagramGraph } from '../persist/diagrams.ts'
import { loadPaperDb } from '../persist/paper-db.ts'
import { listPages } from '../persist/pages.ts'
import { listPapers } from '../persist/papers-catalog.ts'

export type PaperRef = { kind: 'arxiv' | 'id'; value: string }

const ARXIV_IN_TEXT = /(?:arxiv:)?(\d{4}\.\d{4,5})(?:v\d+)?/gi

function pushUnique(out: PaperRef[], kind: PaperRef['kind'], value: string) {
  if (!value || out.some((r) => r.kind === kind && r.value === value)) return
  out.push({ kind, value })
}

function scanText(text: string, out: PaperRef[]) {
  ARXIV_IN_TEXT.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ARXIV_IN_TEXT.exec(text))) {
    const id = parseArxivId(m[1])
    if (id) pushUnique(out, 'arxiv', id)
  }
}

/** Paper catalog ids and arXiv ids cited on diagram nodes or their linked pages. */
export function collectDiagramPaperRefs(graph: DiagramGraph): PaperRef[] {
  const out: PaperRef[] = []
  const pages = listPages()
  for (const node of graph.nodes) {
    for (const pid of node.meta?.paperIds ?? []) {
      const arxiv = parseArxivId(pid)
      if (arxiv) pushUnique(out, 'arxiv', arxiv)
      else pushUnique(out, 'id', pid)
    }
    scanText(`${node.id} ${node.label} ${node.detail ?? ''} ${node.meta?.summaryLong ?? ''}`, out)
    const pageId = node.meta?.pageId
    if (pageId) {
      const page = pages.find((p) => p.id === pageId || `page:${p.slug}` === pageId)
      for (const cite of page?.citations ?? []) {
        const arxiv = parseArxivId(cite)
        if (arxiv) pushUnique(out, 'arxiv', arxiv)
        else pushUnique(out, 'id', cite)
      }
    }
  }
  return out
}

function alreadyInDb(ref: PaperRef) {
  const papers = listPapers()
  const db = loadPaperDb()
  const ids = new Set([...papers.map((p) => p.id), ...db.papers.map((p) => p.id)])
  const arxivs = new Set(
    [...papers, ...db.papers]
      .map((p) => p.arxiv)
      .filter((a) => a && a !== 'n/a')
      .map((a) => parseArxivId(a) || a),
  )
  if (ref.kind === 'arxiv') return arxivs.has(ref.value) || ids.has(`arxiv-${ref.value.replace(/[.]/g, '-')}`)
  return ids.has(ref.value)
}

function fetchInput(ref: PaperRef): { arxiv?: string; id?: string } | null {
  if (ref.kind === 'arxiv') return { arxiv: ref.value }
  const rec = listPapers().find((p) => p.id === ref.value)
  if (rec?.arxiv && rec.arxiv !== 'n/a') {
    const arxiv = parseArxivId(rec.arxiv)
    if (arxiv) return { arxiv }
  }
  return null
}

export async function ensurePapersForDiagrams(graphs: DiagramGraph[]) {
  const refs = graphs.flatMap(collectDiagramPaperRefs)
  const fetched: string[] = []
  const skipped: string[] = []
  const errors: string[] = []
  for (const ref of refs) {
    const key = `${ref.kind}:${ref.value}`
    if (alreadyInDb(ref)) {
      skipped.push(key)
      continue
    }
    const input = fetchInput(ref)
    if (!input) {
      skipped.push(key)
      continue
    }
    try {
      const saved = await fetchAndIngestPaper(input)
      fetched.push(saved.id)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }
  return { ok: errors.length === 0, fetched, skipped, errors }
}
