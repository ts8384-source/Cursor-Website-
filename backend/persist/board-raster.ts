import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { boardsDir, diagramsDir, papersDir, root } from '../paths.ts'
import { loadAllDiagrams, type DiagramGraph } from './diagrams.ts'
import { loadPage } from './pages.ts'
import { loadPaperDb, loadPaperRecord, mathLexicon } from './paper-db.ts'
import { wrapLines } from './png.ts'

type RasterBoard = {
  id: string
  title: string
  gist: string
  sourceType: string
  sourceId: string
  sourceSlug?: string
  tags: string[]
}

type RasterInput = {
  surface?: string
  stamp?: boolean
  assets?: IncomingAsset[]
  imageBase64?: string
  pdfBase64?: string
  w?: number
  h?: number
}

export const MAX_BOARD_BYTES = 8 * 1024 * 1024
export const MAX_CLIENT_ASSET_BYTES = 1_500_000
export const MAX_PAPER_PAGES = 8

export type BoardSurface = 'clean' | 'stamped'

export type BoardAsset = {
  file: string
  mime: string
  w: number
  h: number
  kind: 'image' | 'pdf'
}

export type IncomingAsset = {
  file?: string
  mime?: string
  base64?: string
  w?: number
  h?: number
}

type RasterPage = { buf: Buffer; mime: string; ext: 'svg' | 'png'; w: number; h: number }

function xml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function parseSurface(input: RasterInput): BoardSurface {
  const raw = String(input.surface ?? '').toLowerCase()
  if (raw === 'stamped' || raw === 'with-page' || raw === 'artifact' || input.stamp === true) return 'stamped'
  return 'clean'
}

export function boardFolderName(id: string) {
  return id.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

export function boardAssetDir(id: string) {
  return join(boardsDir, boardFolderName(id))
}

export function findPaperPdf(paperId: string): string | null {
  const direct = join(papersDir, 'pdf', `${paperId}.pdf`)
  if (existsSync(direct)) return direct
  const rec = loadPaperRecord(paperId)
  const raw = existsSync(join(papersDir, `${paperId}.md`)) ? readFileSync(join(papersDir, `${paperId}.md`), 'utf8') : ''
  const local = /\*\*local_pdf:\*\*\s+(\S+)/i.exec(raw)?.[1]
  if (local && local !== 'n/a') {
    const abs = local.startsWith('pdf/') ? join(papersDir, local) : join(root, local)
    if (existsSync(abs)) return abs
  }
  if (rec?.file) {
    const guess = join(papersDir, 'pdf', `${rec.id}.pdf`)
    if (existsSync(guess)) return guess
  }
  return null
}

function pngSize(buf: Buffer): { w: number; h: number } {
  if (buf.length < 24 || buf[0] !== 137) return { w: 1000, h: 1400 }
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

function jpegSize(buf: Buffer): { w: number; h: number } | null {
  let i = 2
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) break
    const marker = buf[i + 1]
    const len = buf.readUInt16BE(i + 2)
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }
    }
    i += 2 + len
  }
  return null
}

function decodeDataUrl(raw?: string): { mime: string; buf: Buffer } | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.length > 3_000_000) return null
  let mime = 'application/octet-stream'
  let b64 = trimmed
  if (trimmed.startsWith('data:')) {
    const comma = trimmed.indexOf(',')
    if (comma < 0) return null
    const header = trimmed.slice(5, comma)
    mime = header.split(';')[0]?.trim() || mime
    b64 = trimmed.slice(comma + 1)
  }
  try {
    const buf = Buffer.from(b64.replace(/\s+/g, ''), 'base64')
    if (!buf.length || buf.length > MAX_CLIENT_ASSET_BYTES) return null
    return { mime, buf }
  } catch {
    return null
  }
}

function writeClientImage(dir: string, decoded: { mime: string; buf: Buffer }, hintW?: number, hintH?: number): BoardAsset[] {
  const jpeg = decoded.mime.includes('jpeg') || decoded.mime.includes('jpg') || decoded.buf[0] === 0xff
  const ext = jpeg ? 'jpg' : decoded.mime.includes('webp') ? 'webp' : 'png'
  const mime = jpeg ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
  const file = `page-01.${ext}`
  writeFileSync(join(dir, file), decoded.buf)
  const parsed = jpeg ? jpegSize(decoded.buf) : pngSize(decoded.buf)
  return [{ file, mime, w: hintW || parsed?.w || 1600, h: hintH || parsed?.h || 900, kind: 'image' }]
}

function writeClientPdf(dir: string, buf: Buffer): { pdfFile: string; assets: BoardAsset[] } {
  const pdfFile = 'source.pdf'
  writeFileSync(join(dir, pdfFile), buf)
  return { pdfFile, assets: renderPdfPages(join(dir, pdfFile), dir) }
}

function stripMd(text: string) {
  return text
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/^#+\s+/gm, '')
    .replace(/\[@([^\]]+)\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`+/g, '')
    .replace(/\*\*?/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
}

function asSvg(buf: Buffer, w: number, h: number): RasterPage {
  return { buf, mime: 'image/svg+xml', ext: 'svg', w, h }
}

function textPages(title: string, body: string, kicker = ''): RasterPage[] {
  const width = 800
  const height = 1100
  const lines = wrapLines([kicker, title, '', body].filter(Boolean).join('\n'), 68)
  const per = 42
  const pages: RasterPage[] = []
  for (let i = 0; i < lines.length && pages.length < 4; i += per) {
    const rows = lines
      .slice(i, i + per)
      .map((line, idx) => `<text x="28" y="${72 + idx * 22}" font-size="14" fill="#1a1814">${xml(line)}</text>`)
      .join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#fffef8"/><text x="28" y="36" font-size="13" fill="#5a78a0">${xml(kicker || title.slice(0, 40))}</text>${rows}</svg>`
    pages.push(asSvg(Buffer.from(svg, 'utf8'), width, height))
  }
  return pages.length ? pages : [asSvg(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fffef8"/></svg>`, 'utf8'), width, height)]
}

function diagramCachePath(graphId: string) {
  return join(diagramsDir, `${graphId.replace(/[^a-zA-Z0-9._-]+/g, '_')}.svg`)
}

function diagramSvg(graph: DiagramGraph, highlight?: string): RasterPage {
  const cached = diagramCachePath(graph.id)
  if (!highlight && existsSync(cached)) {
    const buf = readFileSync(cached)
    if (buf.length > 40 && buf.length < MAX_BOARD_BYTES) return asSvg(buf, 1000, 640)
  }
  const width = 1000
  const height = 640
  const nodes = graph.nodes
  const xs = nodes.map((n) => n.x ?? 0)
  const ys = nodes.map((n) => n.y ?? 0)
  const minX = Math.min(...xs, 0)
  const minY = Math.min(...ys, 0)
  const maxX = Math.max(...xs, 400)
  const maxY = Math.max(...ys, 200)
  const spanX = Math.max(1, maxX - minX)
  const spanY = Math.max(1, maxY - minY)
  const pad = 80
  const pos = new Map<string, { x: number; y: number }>()
  nodes.forEach((n, i) => {
    const nx = n.x ?? (i % 5) * 180
    const ny = n.y ?? Math.floor(i / 5) * 120
    pos.set(n.id, {
      x: pad + ((nx - minX) / spanX) * (width - pad * 2),
      y: 70 + ((ny - minY) / spanY) * (height - 140),
    })
  })
  const edges = graph.edges
    .map((e) => {
      const a = pos.get(e.from)
      const b = pos.get(e.to)
      if (!a || !b) return ''
      return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#5a78a0" stroke-width="2"/>`
    })
    .join('')
  const boxes = nodes
    .map((n) => {
      const p = pos.get(n.id)
      if (!p) return ''
      const w = 150
      const h = 44
      const fill = highlight && n.id === highlight ? '#c8dcff' : '#e8ecf4'
      return `<g><rect x="${(p.x - w / 2).toFixed(1)}" y="${(p.y - h / 2).toFixed(1)}" width="${w}" height="${h}" fill="${fill}" stroke="#1a1814"/><text x="${(p.x - w / 2 + 8).toFixed(1)}" y="${(p.y + 4).toFixed(1)}" font-size="13" fill="#1a1814">${xml(n.label.slice(0, 22))}</text></g>`
    })
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#fffef8"/><text x="24" y="28" font-size="18" fill="#1a1814">${xml(graph.title)}</text>${edges}${boxes}</svg>`
  const buf = Buffer.from(svg, 'utf8')
  if (!highlight && buf.length < MAX_BOARD_BYTES) {
    try {
      writeFileSync(cached, buf)
    } catch {
      // cache is optional
    }
  }
  return asSvg(buf, width, height)
}

function writeRasters(dir: string, pages: RasterPage[], prefix: string): BoardAsset[] {
  const assets: BoardAsset[] = []
  let used = 0
  pages.forEach((page, i) => {
    if (used + page.buf.length > MAX_BOARD_BYTES && assets.length) return
    const file = `${prefix}-${String(i + 1).padStart(2, '0')}.${page.ext}`
    writeFileSync(join(dir, file), page.buf)
    assets.push({ file, mime: page.mime, w: page.w, h: page.h, kind: 'image' })
    used += page.buf.length
  })
  return assets
}

function renderPdfPages(pdfAbs: string, dir: string): BoardAsset[] {
  const script = join(root, 'backend', 'scripts', 'pdf_pages.py')
  const run = spawnSync('python', [script, pdfAbs, dir, String(MAX_PAPER_PAGES), String(MAX_BOARD_BYTES)], {
    encoding: 'utf8',
    timeout: 8_000,
  })
  if (run.status !== 0) return []
  const assets: BoardAsset[] = []
  for (const name of readdirSync(dir).sort()) {
    if (!/^page-\d+\.png$/i.test(name)) continue
    const abs = join(dir, name)
    const buf = readFileSync(abs)
    const { w, h } = pngSize(buf)
    assets.push({ file: name, mime: 'image/png', w, h, kind: 'image' })
  }
  return assets
}

function generateForSource(board: RasterBoard): RasterPage[] {
  if (board.sourceType === 'page') {
    const slug = board.sourceSlug || board.sourceId.replace(/^page:/, '')
    const page = loadPage(slug)
    return textPages(page?.title || board.title, stripMd(page?.body || board.gist), `page · ${slug}`)
  }
  if (board.sourceType === 'diagram' || board.sourceType === 'node') {
    const graphId =
      board.sourceType === 'diagram'
        ? board.sourceId.replace(/^diagram:/, '')
        : board.sourceId.split(':')[1]
    const nodeId = board.sourceType === 'node' ? board.sourceId.split(':').slice(2).join(':') : undefined
    const graph = loadAllDiagrams().find((g) => g.id === graphId)
    if (graph) return [diagramSvg(graph, nodeId)]
    return textPages(board.title, board.gist, 'diagram')
  }
  if (board.sourceType === 'math') {
    const term = board.sourceId.replace(/^math:/, '')
    const hit = mathLexicon().find((t) => t.term.toLowerCase() === term.toLowerCase())
    return textPages(hit?.term || term, hit?.def || board.gist, 'math')
  }
  if (board.sourceType === 'paper') {
    const rec = loadPaperRecord(board.sourceId)
    const db = loadPaperDb().papers.find((p) => p.id === board.sourceId)
    const body = [db?.summary || rec?.title || board.gist, rec ? `${rec.authors}. ${rec.year}. ${rec.venue}.` : '']
      .filter(Boolean)
      .join('\n\n')
    return textPages(rec?.title || board.title, body, `paper · ${board.sourceId}`)
  }
  return textPages(board.title, board.gist)
}

export function attachStampedAssets<T extends RasterBoard>(board: T, input: RasterInput): T & {
  surface: BoardSurface
  assetPath: string
  assets: BoardAsset[]
  pdfFile?: string
} {
  const dir = boardAssetDir(board.id)
  mkdirSync(dir, { recursive: true })
  let assets: BoardAsset[] = []
  let pdfFile: string | undefined

  if (board.sourceType === 'paper') {
    const pdfAbs = findPaperPdf(board.sourceId)
    if (pdfAbs) {
      pdfFile = 'source.pdf'
      copyFileSync(pdfAbs, join(dir, pdfFile))
      assets = renderPdfPages(pdfAbs, dir)
    }
  } else {
    const image = decodeDataUrl(input.imageBase64)
    const pdf = decodeDataUrl(input.pdfBase64)
    const imageOk = Boolean(image && (image.mime.startsWith('image/') || image.buf[0] === 0xff || image.buf[0] === 137))
    const pdfOk = Boolean(pdf && (pdf.mime.includes('pdf') || pdf.buf.subarray(0, 4).toString('ascii') === '%PDF'))
    // Client capture wins. Never generate the dummy SVG when a JPEG/PNG arrived.
    if (imageOk && image) {
      assets = writeClientImage(dir, image, input.w, input.h)
    } else if (pdfOk && pdf) {
      const written = writeClientPdf(dir, pdf.buf)
      pdfFile = written.pdfFile
      assets = written.assets
    }
  }

  if (!assets.length) assets = writeRasters(dir, generateForSource(board), 'page')

  const rel = `data/boards/${boardFolderName(board.id)}`
  return {
    ...board,
    surface: 'stamped',
    assetPath: rel,
    assets,
    pdfFile,
    tags: [...new Set([...board.tags, 'stamped'])],
  }
}

export function resolveBoardAsset(board: { id: string; assets?: BoardAsset[]; pdfFile?: string }, file: string) {
  const safe = file.replace(/[^a-zA-Z0-9._-]+/g, '')
  if (!safe) return null
  const allowed = new Set((board.assets ?? []).map((a) => a.file))
  if (board.pdfFile) allowed.add(board.pdfFile)
  if (!allowed.has(safe)) return null
  const abs = join(boardAssetDir(board.id), safe)
  if (!existsSync(abs) || !statSync(abs).isFile()) return null
  return abs
}
