import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { boardsDir } from '../paths.ts'
import {
  attachStampedAssets,
  parseSurface,
  type BoardAsset,
  type BoardSurface,
  type IncomingAsset,
} from './board-raster.ts'
import { loadAllDiagrams } from './diagrams.ts'
import { listPages, loadPage } from './pages.ts'
import { loadPaperDb, loadPaperRecord, mathLexicon } from './paper-db.ts'

export type { BoardAsset, BoardSurface, IncomingAsset }

export const BOARD_SOURCE_TYPES = ['page', 'paper', 'diagram', 'math', 'node'] as const
export type BoardSourceType = (typeof BOARD_SOURCE_TYPES)[number]

export type BoardBackdrop = {
  kind: BoardSourceType
  text: string
  href?: string
}

export type TiedBoard = {
  id: string
  type: 'board'
  title: string
  sourceType: BoardSourceType
  sourceId: string
  sourceSlug?: string
  pageId?: string
  paperIds: string[]
  related: string[]
  citations: string[]
  boardKey: string
  persistenceKey: string
  href: string
  padHref: string
  gist: string
  backdrop: BoardBackdrop
  surface: BoardSurface
  assetPath?: string
  assets: BoardAsset[]
  pdfFile?: string
  tags: string[]
  createdAt: string
  updated: string
  summary: { short: string; long: string }
}

export type CreateBoardInput = {
  sourceType?: string
  sourceId?: string
  sourceSlug?: string
  title?: string
  pageId?: string
  paperIds?: string[]
  related?: string[]
  citations?: string[]
  gist?: string
  surface?: string
  stamp?: boolean
  assets?: IncomingAsset[]
  imageBase64?: string
  pdfBase64?: string
  w?: number
  h?: number
}

export type ParkBoardMeta = {
  boardId?: string
  pageId?: string
  paperIds?: string[]
  sourceType?: BoardSourceType | string
  sourceId?: string
  sourceSlug?: string
  boardKey?: string
  surface?: BoardSurface | string
  assetPath?: string
}

type BoardStore = { boards: TiedBoard[]; currentId: string | null }

/** Presence hint only — send never waits on this. Pending poll also counts as seen. */
export const PAD_ONLINE_MS = 45_000

function storePath() {
  mkdirSync(boardsDir, { recursive: true })
  return join(boardsDir, 'index.json')
}

function currentPath() {
  mkdirSync(boardsDir, { recursive: true })
  return join(boardsDir, 'current.json')
}

function activePath() {
  mkdirSync(boardsDir, { recursive: true })
  return join(boardsDir, 'ACTIVE')
}

function padSeenPath() {
  mkdirSync(boardsDir, { recursive: true })
  return join(boardsDir, 'pad-seen.json')
}

function readStore(): BoardStore {
  const file = storePath()
  if (!existsSync(file)) return { boards: [], currentId: null }
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as BoardStore
    const boards = (raw.boards ?? []).map((b) => ({
      ...b,
      surface: b.surface === 'stamped' ? 'stamped' : 'clean',
      assets: b.assets ?? [],
    }))
    return { boards, currentId: raw.currentId ?? null }
  } catch {
    return { boards: [], currentId: null }
  }
}

function writeStore(store: BoardStore) {
  writeFileSync(storePath(), `${JSON.stringify(store, null, 2)}\n`, 'utf8')
  writeFileSync(activePath(), store.currentId ? `${store.currentId}\n` : '', 'utf8')
  writeFileSync(
    currentPath(),
    `${JSON.stringify(
      {
        id: store.currentId,
        updated: new Date().toISOString(),
        padHref: store.currentId ? `/?board=${encodeURIComponent(store.currentId)}` : '/',
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
}

function slugPart(id: string) {
  return id.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).toLowerCase() || 'src'
}

function uniq(ids: string[]) {
  return [...new Set(ids.filter(Boolean))]
}

function words(text: string, n: number) {
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).slice(0, n).join(' ')
}

function resolveSource(input: CreateBoardInput): {
  sourceType: BoardSourceType
  sourceId: string
  title: string
  gist: string
  href: string
  sourceSlug?: string
  pageId?: string
  paperIds: string[]
  related: string[]
  citations: string[]
  tags: string[]
} {
  const sourceType = input.sourceType as BoardSourceType
  if (!BOARD_SOURCE_TYPES.includes(sourceType)) {
    throw new Error('sourceType must be page, paper, diagram, math, or node')
  }
  const sourceId = (input.sourceId ?? '').trim()
  if (!sourceId) throw new Error('sourceId required')

  let title = input.title?.trim() || sourceId
  let gist = input.gist?.trim() || ''
  let href = '/site/overview'
  let sourceSlug = input.sourceSlug?.trim() || undefined
  let pageId = input.pageId?.trim() || undefined
  let paperIds = input.paperIds ?? []
  let related = input.related ?? []
  let citations = input.citations ?? []
  let tags = ['tied-board', sourceType]

  if (sourceType === 'page') {
    const slug = sourceSlug || (sourceId.startsWith('page:') ? sourceId.slice('page:'.length) : sourceId)
    const page = loadPage(slug)
    if (page) {
      title = input.title?.trim() || page.title
      gist = gist || page.gist || page.summaryLong || page.title
      href = `/site/${page.slug}`
      sourceSlug = page.slug
      pageId = page.id
      citations = citations.length ? citations : page.citations
      related = related.length ? related : page.related
      paperIds = paperIds.length ? paperIds : page.citations
      tags = [...tags, ...page.tags]
    } else {
      sourceSlug = slug
      pageId = pageId || `page:${slug}`
      href = `/site/${slug}`
    }
  }

  if (sourceType === 'paper') {
    const rec = loadPaperRecord(sourceId) ?? loadPaperDb().papers.find((p) => p.id === sourceId)
    if (rec) {
      title = input.title?.trim() || rec.title
      gist = gist || rec.summary || rec.title
      href = `/site/papers#${rec.id}`
      paperIds = uniq([rec.id, ...paperIds])
      citations = uniq([rec.id, ...citations])
      related = uniq([...related, ...listPages().filter((p) => p.citations.includes(rec.id)).map((p) => p.id)])
      tags = [...tags, rec.list, rec.year].filter(Boolean)
    } else {
      href = `/site/papers#${sourceId}`
      paperIds = uniq([sourceId, ...paperIds])
      citations = uniq([sourceId, ...citations])
    }
  }

  if (sourceType === 'diagram') {
    const id = sourceId.startsWith('diagram:') ? sourceId.slice('diagram:'.length) : sourceId
    const graph = loadAllDiagrams().find((g) => g.id === id)
    if (graph) {
      title = input.title?.trim() || graph.title
      gist = gist || `${graph.title}: ${graph.nodes.length} nodes. Scribble on this diagram; park to update the site.`
      href = '/site/diagrams'
      related = uniq([...related, `diagram:${graph.id}`, ...graph.nodes.map((n) => `node:${graph.id}:${n.id}`)])
      tags = [...tags, graph.id]
    } else {
      href = '/site/diagrams'
    }
  }

  if (sourceType === 'node') {
    const parts = sourceId.startsWith('node:') ? sourceId.split(':') : []
    const graphId = parts[1]
    const nodeId = parts.slice(2).join(':')
    const graph = loadAllDiagrams().find((g) => g.id === graphId)
    const node = graph?.nodes.find((n) => n.id === nodeId)
    if (graph && node) {
      title = input.title?.trim() || node.label
      gist = gist || node.meta?.summaryLong || node.meta?.summaryShort || node.label
      href = `/site/diagrams#${node.id}`
      pageId = pageId || node.meta?.pageId
      paperIds = uniq([...(node.meta?.paperIds ?? []), ...paperIds])
      citations = uniq([...(node.meta?.paperIds ?? []), ...citations])
      related = uniq([...(node.meta?.related ?? []), ...related, `diagram:${graph.id}`, `node:${graph.id}:${node.id}`])
    } else {
      href = '/site/diagrams'
    }
  }

  if (sourceType === 'math') {
    const term = sourceId.startsWith('math:') ? sourceId.slice('math:'.length) : sourceId
    const hit = mathLexicon().find((t) => t.term.toLowerCase() === term.toLowerCase())
    title = input.title?.trim() || hit?.term || term
    gist = gist || hit?.def || `Scribble on the math term “${term}”.`
    href = `/site/maps#math-${encodeURIComponent(term.toLowerCase().replace(/\s+/g, '-'))}`
    sourceSlug = sourceSlug || 'maps'
    pageId = pageId || 'page:maps'
    if (hit?.paperId) {
      paperIds = uniq([hit.paperId, ...paperIds])
      citations = uniq([hit.paperId, ...citations])
    }
    related = uniq(['page:maps', ...related])
    tags = [...tags, 'math', term.toLowerCase()]
  }

  if (pageId && !related.includes(pageId)) related.push(pageId)
  return {
    sourceType,
    sourceId,
    title,
    gist: gist || title,
    href,
    sourceSlug,
    pageId,
    paperIds: uniq(paperIds),
    related: uniq(related),
    citations: uniq(citations),
    tags: uniq(tags),
  }
}

export function listTiedBoards(): TiedBoard[] {
  return readStore().boards
}

export function loadTiedBoard(id: string): TiedBoard | null {
  const wanted = decodeURIComponent(id)
  return listTiedBoards().find((b) => b.id === wanted) ?? null
}

export function currentTiedBoard(): TiedBoard | null {
  const store = readStore()
  if (!store.currentId) return null
  return store.boards.find((b) => b.id === store.currentId) ?? null
}

function readActiveId(): string | null {
  const file = activePath()
  if (existsSync(file)) {
    const raw = readFileSync(file, 'utf8').trim()
    if (raw) return raw
  }
  return readStore().currentId
}

export function pendingTiedBoard(): { id: string | null; board: TiedBoard | null; updated: string | null } {
  const id = readActiveId()
  const board = id ? loadTiedBoard(id) : null
  return { id: board?.id ?? id, board, updated: board?.updated ?? null }
}

export function touchPadHeartbeat() {
  writeFileSync(padSeenPath(), `${JSON.stringify({ lastSeen: new Date().toISOString() }, null, 2)}\n`, 'utf8')
}

export function padPresence(maxAgeMs = PAD_ONLINE_MS): { online: boolean; lastSeen: string | null } {
  const file = padSeenPath()
  if (!existsSync(file)) return { online: false, lastSeen: null }
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as { lastSeen?: string }
    const lastSeen = raw.lastSeen ?? null
    if (!lastSeen) return { online: false, lastSeen: null }
    const t = Date.parse(lastSeen)
    if (!Number.isFinite(t)) return { online: false, lastSeen }
    return { online: Date.now() - t <= maxAgeMs, lastSeen }
  } catch {
    return { online: false, lastSeen: null }
  }
}

export function createTiedBoard(input: CreateBoardInput): TiedBoard {
  const resolved = resolveSource(input)
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const id = `board:${slugPart(resolved.sourceId)}-${suffix}`
  const boardKey = `ipad-tied-${slugPart(id)}`
  const now = new Date().toISOString()
  const board: TiedBoard = {
    id,
    type: 'board',
    title: resolved.title,
    sourceType: resolved.sourceType,
    sourceId: resolved.sourceId,
    sourceSlug: resolved.sourceSlug,
    pageId: resolved.pageId,
    paperIds: resolved.paperIds,
    related: resolved.related,
    citations: resolved.citations,
    boardKey,
    persistenceKey: boardKey,
    href: resolved.href,
    padHref: `/?board=${encodeURIComponent(id)}`,
    gist: resolved.gist,
    backdrop: { kind: resolved.sourceType, text: resolved.gist, href: resolved.href },
    surface: parseSurface(input),
    assets: [],
    tags: resolved.tags,
    createdAt: now,
    updated: now,
    summary: { short: words(resolved.title, 8), long: resolved.gist },
  }
  const finished = board.surface === 'stamped' ? attachStampedAssets(board, input) : { ...board, tags: [...board.tags, 'clean'] }
  const store = readStore()
  store.boards.push(finished)
  store.currentId = finished.id
  writeStore(store)
  return finished
}

export function parkMetaFromBoard(board: TiedBoard | null): ParkBoardMeta | undefined {
  if (!board) return undefined
  return {
    boardId: board.id,
    pageId: board.pageId,
    paperIds: board.paperIds,
    sourceType: board.sourceType,
    sourceId: board.sourceId,
    sourceSlug: board.sourceSlug,
    boardKey: board.boardKey,
    surface: board.surface,
    assetPath: board.assetPath,
  }
}

export function mergeParkMeta(base: Record<string, unknown>, meta?: ParkBoardMeta | null) {
  if (!meta) return base
  return {
    ...base,
    boardId: meta.boardId ?? null,
    pageId: meta.pageId ?? null,
    paperIds: meta.paperIds ?? [],
    sourceType: meta.sourceType ?? null,
    sourceId: meta.sourceId ?? null,
    sourceSlug: meta.sourceSlug ?? null,
    boardKey: meta.boardKey ?? null,
    surface: meta.surface ?? null,
    assetPath: meta.assetPath ?? null,
  }
}
