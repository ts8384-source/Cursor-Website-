import { existsSync, readFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import type { IncomingMessage } from 'node:http'
import { repoTree } from '../ingest/files.ts'
import { fetchAndIngestPaper } from '../ingest/paper-fetch.ts'
import { writeInboxSnapshot, type SnapshotPayload } from '../ingest/snapshot.ts'
import { inboxDir, padPort } from '../paths.ts'
import { bookkeep, readBookkeep } from '../persist/bookkeep.ts'
import { docsStatus, removeDocWiki } from '../persist/docs.ts'
import { siteOverview } from '../persist/overview.ts'
import { groupSandboxPages, listPages, loadPage, pageTree, pagesForBin, pagesForProject, type PageBin } from '../persist/pages.ts'
import { promoteSandboxPage } from '../persist/sandbox-pages.ts'
import { fetchCodeForQuery, executionTable, loadMaps } from '../persist/code-map.ts'
import { ensurePapersForDiagrams } from '../ingest/diagram-papers.ts'
import { diagramsPayload, loadAllDiagrams } from '../persist/diagrams.ts'
import { forgetMemory, listMemory, remember, touchMemory, type MemoryLane } from '../persist/memory.ts'
import { loadPaperDb, loadPaperRecord, mathLexicon, rebuildPaperDb } from '../persist/paper-db.ts'
import { listPapers } from '../persist/papers-catalog.ts'
import { listProjects, loadProject } from '../persist/projects.ts'
import { toolCatalog } from '../persist/tool-catalog.ts'
import { loadDemo } from '../retrieve/demo.ts'
import { hybridSearch, runAsk } from '../retrieve/hybrid.ts'
import { findPaperPdf, resolveBoardAsset } from '../persist/board-raster.ts'
import {
  createTiedBoard,
  currentTiedBoard,
  listTiedBoards,
  loadTiedBoard,
  padPresence,
  pendingTiedBoard,
  touchPadHeartbeat,
} from '../persist/boards.ts'
import { META_TYPES, loadMeta, metaIndex, type MetaType } from '../persist/meta.ts'
import { graphNeighborhood, knowledgeGraphPayload } from '../persist/graph.ts'
import { generateSeed } from '../persist/generate-seed.ts'
import { addMgmLesson, disarmMgm, hireMgm, tripwires } from '../persist/tripwires.ts'
import { addImplement, completeImplement, listImplement } from '../persist/implement.ts'
import { addLesson, forkSandbox, listSandbox, proposeSandbox } from '../persist/sandbox.ts'
import { listSandboxFlags, setSandboxFlag } from '../persist/sandbox-flags.ts'
import { listSandboxTrash, putSandboxTrash, restoreSandboxTrash } from '../persist/sandbox-trash.ts'
import { listCondensedReturns, recordCondensedReturn } from '../persist/condensed-return.ts'
import { SCRIPT_ALLOW, runRag, type ScriptName } from '../scripts/runner.ts'
import { json, pathname, queryParams, readBody, type Res } from './io.ts'

let snapshotBusy = false

function isLanV4(addr: { family: string | number; internal: boolean }) {
  return (addr.family === 'IPv4' || addr.family === 4) && !addr.internal
}

/** Tailscale CGNAT (100.64/10). Prefer these on pairing / health so the iPad pad URL is first. */
function isTailscaleCgnat(ip: string) {
  const parts = ip.split('.').map((p) => Number(p))
  return parts.length === 4 && parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127
}

function ifaceIsVirtual(name: string) {
  return /vEthernet|WSL|Hyper-V|Bluetooth|VirtualBox|VMware|Docker|Default Switch|Loopback/i.test(name)
}

type UrlKind = 'tailscale' | 'lan' | 'loopback'

function lanItems(port: number) {
  const seen = new Set<string>()
  const items: { url: string; kind: UrlKind }[] = []
  const add = (ip: string, kind: UrlKind) => {
    const url = `http://${ip}:${port}/`
    if (seen.has(url)) return
    seen.add(url)
    items.push({ url, kind })
  }
  add('127.0.0.1', 'loopback')
  try {
    for (const [name, addrs] of Object.entries(networkInterfaces())) {
      if (ifaceIsVirtual(name)) continue
      for (const addr of addrs ?? []) {
        if (!isLanV4(addr)) continue
        add(addr.address, isTailscaleCgnat(addr.address) ? 'tailscale' : 'lan')
      }
    }
  } catch {
    // keep loopback
  }
  const rank: Record<UrlKind, number> = { tailscale: 0, lan: 1, loopback: 2 }
  items.sort((a, b) => rank[a.kind] - rank[b.kind])
  return items
}

function siteHref(padUrl: string) {
  return `${padUrl.replace(/\/$/, '')}/site/overview`
}

function pairPayload() {
  const items = lanItems(padPort)
  const urls = items.map((i) => i.url)
  const pad = items.find((i) => i.kind === 'tailscale')?.url ?? urls[0]
  const lan = items.find((i) => i.kind === 'lan')?.url
  const loop = items.find((i) => i.kind === 'loopback')?.url ?? `http://127.0.0.1:${padPort}/`
  return {
    urls,
    pad,
    site: siteHref(loop),
    siteLan: lan ? siteHref(lan) : undefined,
    kinds: items,
  }
}

function scriptDesc(name: ScriptName) {
  if (name === 'seed') return 'Ingest architecture + handbook + drop folders'
  if (name === 'rebuild') return 'Rebuild Chroma+BM25 indexes'
  if (name === 'ask') return 'Ingest scribble and write md + diagram'
  return 'Print latest site payload'
}

/** HTTP only. Side effects live in ingest / retrieve / persist / scripts. */
export async function handleApi(req: IncomingMessage, res: Res): Promise<boolean> {
  const path = pathname(req)
  if (!path.startsWith('/api/')) return false

  if (req.method === 'GET' && path === '/api/health') {
    json(res, 200, { ok: true, inbox: inboxDir, padPort, ...pairPayload() })
    return true
  }

  if (req.method === 'GET' && path === '/api/pair') {
    json(res, 200, pairPayload())
    return true
  }

  if (req.method === 'GET' && path === '/api/files') {
    json(res, 200, repoTree())
    return true
  }

  if (req.method === 'POST' && path === '/api/snapshot') {
    if (snapshotBusy) {
      req.resume()
      req.destroy()
      json(res, 503, { ok: false, error: 'snapshot busy' })
      return true
    }
    snapshotBusy = true
    try {
      const raw = await readBody(req, 3_000_000, 8_000)
      const payload = JSON.parse(raw.toString('utf8')) as SnapshotPayload
      const result = await writeInboxSnapshot(payload, raw.length)
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad snapshot' })
    } finally {
      snapshotBusy = false
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/boards') {
    json(res, 200, { boards: listTiedBoards(), current: currentTiedBoard() })
    return true
  }

  if (req.method === 'GET' && path === '/api/boards/current') {
    const board = currentTiedBoard()
    json(res, 200, { board, padHref: board?.padHref ?? '/', pad: padPresence() })
    return true
  }

  if (req.method === 'GET' && path === '/api/boards/pending') {
    // A live pad poll is presence. Do not require a separate heartbeat first.
    touchPadHeartbeat()
    const pending = pendingTiedBoard()
    json(res, 200, { ...pending, pad: padPresence() })
    return true
  }

  if (req.method === 'POST' && path === '/api/boards/heartbeat') {
    // Incoming pad poll — not an outbound fetch. Do not run SSRF / CGNAT blocks here.
    touchPadHeartbeat()
    json(res, 200, { ok: true, pad: padPresence() })
    return true
  }

  if (req.method === 'GET' && path === '/api/boards/file') {
    const id = queryParams(req).get('id') || ''
    const name = queryParams(req).get('name') || ''
    const board = loadTiedBoard(id)
    const abs = board ? resolveBoardAsset(board, name) : null
    if (!board || !abs) {
      json(res, 404, { ok: false, error: 'asset not found' })
      return true
    }
    const buf = readFileSync(abs)
    const mime =
      board.assets.find((a) => a.file === name)?.mime ||
      (abs.endsWith('.pdf') ? 'application/pdf' : abs.endsWith('.jpg') || abs.endsWith('.jpeg') ? 'image/jpeg' : abs.endsWith('.svg') ? 'image/svg+xml' : 'image/png')
    res.statusCode = 200
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(buf)
    return true
  }

  if (req.method === 'GET' && path.startsWith('/api/boards/')) {
    const rest = decodeURIComponent(path.slice('/api/boards/'.length)).replace(/\/$/, '')
    const assetMatch = /^(.+)\/assets\/([^/]+)$/.exec(rest)
    if (assetMatch) {
      const board = loadTiedBoard(assetMatch[1])
      const abs = board ? resolveBoardAsset(board, assetMatch[2]) : null
      if (!board || !abs) {
        json(res, 404, { ok: false, error: 'asset not found' })
        return true
      }
      const buf = readFileSync(abs)
      const mime =
        board.assets.find((a) => a.file === assetMatch[2])?.mime ||
        (abs.endsWith('.pdf') ? 'application/pdf' : abs.endsWith('.jpg') || abs.endsWith('.jpeg') ? 'image/jpeg' : abs.endsWith('.svg') ? 'image/svg+xml' : 'image/png')
      res.statusCode = 200
      res.setHeader('Content-Type', mime)
      res.setHeader('Cache-Control', 'no-store')
      res.end(buf)
      return true
    }
    const board = loadTiedBoard(rest)
    if (!board) {
      json(res, 404, { ok: false, error: 'board not found' })
      return true
    }
    json(res, 200, { board })
    return true
  }

  if (req.method === 'POST' && path === '/api/boards') {
    try {
      const raw = await readBody(req, 4_000_000, 8_000)
      const payload = raw.length ? (JSON.parse(raw.toString('utf8')) as Parameters<typeof createTiedBoard>[0]) : {}
      const board = createTiedBoard(payload)
      const pad = padPresence()
      const pair = pairPayload()
      bookkeep('board', {
        id: board.id,
        sourceType: board.sourceType,
        sourceId: board.sourceId,
        surface: board.surface,
        padOnline: pad.online,
        captured: Boolean(payload.imageBase64 || payload.pdfBase64),
        asset: board.assets[0]?.file ?? null,
        mime: board.assets[0]?.mime ?? null,
      })
      json(res, 200, {
        ok: true,
        board,
        padHref: board.padHref,
        padOnline: pad.online,
        pad,
        urls: pair.urls,
        padUrl: pair.pad,
        site: pair.site,
        siteLan: pair.siteLan,
        liveWrite: false,
        onDemand: true,
        openedTab: false,
      })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad board' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/tools') {
    json(res, 200, toolCatalog())
    return true
  }

  if (req.method === 'GET' && path === '/api/meta') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const type = url.searchParams.get('type') as MetaType | null
    json(
      res,
      200,
      metaIndex({
        q: url.searchParams.get('q') ?? undefined,
        type: type && META_TYPES.includes(type) ? type : undefined,
        tag: url.searchParams.get('tag') ?? undefined,
        citation: url.searchParams.get('citation') ?? undefined,
        related: url.searchParams.get('related') ?? undefined,
        nest: (['encyclopedia', 'sandbox', 'hidden', 'corpus'] as const).includes(
          (url.searchParams.get('nest') ?? '') as 'encyclopedia',
        )
          ? (url.searchParams.get('nest') as 'encyclopedia' | 'sandbox' | 'hidden' | 'corpus')
          : undefined,
        parent: url.searchParams.get('parent') ?? undefined,
        flagged:
          url.searchParams.get('flagged') === '1' || url.searchParams.get('flagged') === 'true'
            ? true
            : url.searchParams.get('flagged') === '0' || url.searchParams.get('flagged') === 'false'
              ? false
              : undefined,
        project: url.searchParams.get('project') ?? undefined,
      }),
    )
    return true
  }

  if (req.method === 'GET' && path.startsWith('/api/meta/')) {
    const id = decodeURIComponent(path.slice('/api/meta/'.length)).replace(/\/$/, '')
    const rec = loadMeta(id)
    if (!rec) {
      json(res, 404, { ok: false, error: 'meta not found' })
      return true
    }
    json(res, 200, rec)
    return true
  }

  if (req.method === 'GET' && path === '/api/graph') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const focus = url.searchParams.get('focus') ?? url.searchParams.get('id') ?? undefined
    const hops = Number(url.searchParams.get('hops') ?? '1')
    const project = url.searchParams.get('project') ?? undefined
    json(res, 200, knowledgeGraphPayload(focus, Number.isFinite(hops) ? hops : 1, project))
    return true
  }

  if (req.method === 'GET' && path === '/api/graph/neighborhood') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const id = url.searchParams.get('id') ?? url.searchParams.get('focus') ?? ''
    if (!id.trim()) {
      json(res, 400, { ok: false, error: 'id required' })
      return true
    }
    const hops = Number(url.searchParams.get('hops') ?? '1')
    const hood = graphNeighborhood(id, Number.isFinite(hops) ? hops : 1)
    json(res, hood.missing ? 404 : 200, { ok: !hood.missing, ...hood })
    return true
  }

  if (req.method === 'GET' && path === '/api/tripwires') {
    json(res, 200, tripwires())
    return true
  }

  if (req.method === 'POST' && path === '/api/tripwires/hire') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { phrase?: string }
      if (!payload.phrase?.trim()) {
        json(res, 400, { ok: false, error: 'phrase required — user must say hire MGM' })
        return true
      }
      const state = hireMgm(payload.phrase)
      bookkeep('mgm-hire', { phrase: payload.phrase.trim(), armed: state.mgm.armed })
      json(res, 200, { ok: true, ...state })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'hire refused' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/tripwires/disarm') {
    const state = disarmMgm()
    bookkeep('mgm-disarm', { armed: false })
    json(res, 200, { ok: true, ...state })
    return true
  }

  if (req.method === 'POST' && path === '/api/tripwires/lesson') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        note?: string
        parentId?: string
        labId?: string
        outcome?: string
      }
      if (!payload.note?.trim()) {
        json(res, 400, { ok: false, error: 'note required' })
        return true
      }
      const lesson = addMgmLesson({
        note: payload.note,
        parentId: payload.parentId,
        labId: payload.labId,
        outcome: payload.outcome,
      })
      bookkeep('mgm-lesson', { id: lesson.id, parentId: lesson.parentId })
      json(res, 200, { ok: true, lesson })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad lesson' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/sandbox') {
    json(res, 200, listSandbox())
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/fork') {
    try {
      const raw = await readBody(req)
      const payload = raw.length ? (JSON.parse(raw.toString('utf8')) as { name?: string }) : {}
      const lab = await forkSandbox({ name: payload.name })
      bookkeep('sandbox-fork', { id: lab.id, branch: lab.branch, worktree: lab.worktree })
      json(res, 200, { ok: true, lab, autoMerge: false })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'fork failed' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/propose') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { id?: string; name?: string; note?: string }
      const lab = proposeSandbox(payload)
      bookkeep('sandbox-propose', { id: lab.id, status: lab.status })
      json(res, 200, { ok: true, lab, autoMerge: false, merge: false })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'propose failed' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/promote') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        slug?: string
        destSlug?: string
        phrase?: string
        note?: string
      }
      const result = promoteSandboxPage({
        slug: payload.slug ?? '',
        destSlug: payload.destSlug,
        phrase: payload.phrase,
        note: payload.note,
      })
      bookkeep('sandbox-promote', { source: result.sourceSlug, dest: result.destSlug, merge: false })
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'promote failed', merge: false })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/sandbox/flags') {
    json(res, 200, listSandboxFlags())
    return true
  }

  if (req.method === 'GET' && path === '/api/sandbox/trash') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    json(res, 200, listSandboxTrash({ forgotten: url.searchParams.get('forgotten') === '1' }))
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/trash') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { slug?: string; id?: string; note?: string }
      const slug = (payload.slug ?? payload.id?.replace(/^page:/, '') ?? '').trim()
      const page = loadPage(slug)
      if (!page) {
        json(res, 404, { ok: false, error: 'page not found' })
        return true
      }
      if (!page.sandbox) {
        json(res, 400, { ok: false, error: 'trash is lab-bench only — encyclopedia pages do not decay' })
        return true
      }
      const result = putSandboxTrash({ slug: page.slug, id: page.id, title: page.nav || page.title, note: payload.note })
      bookkeep('sandbox-trash', { slug: page.slug })
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'trash failed' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/trash/restore') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { slug?: string }
      const result = restoreSandboxTrash(payload.slug ?? '')
      bookkeep('sandbox-trash-restore', { slug: payload.slug })
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'restore failed' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/flag') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        slug?: string
        id?: string
        flagged?: boolean
        note?: string
      }
      const result = setSandboxFlag(payload)
      bookkeep('sandbox-flag', { slug: result.slug, flagged: result.flagged })
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'flag failed' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/condensed') {
    json(res, 200, listCondensedReturns())
    return true
  }

  if (req.method === 'POST' && path === '/api/condensed') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        role?: string
        gist?: string
        ids?: Array<string | { id: string; kind?: 'page' | 'paper' | 'chunk' | 'code' | 'diagram' | 'board' | 'memory' | 'other' }>
        hrefs?: string[]
        citations?: string[]
      }
      const result = recordCondensedReturn(payload)
      bookkeep('condensed-return', { id: result.recorded.id, nIds: result.recorded.ids.length })
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'condensed failed' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/sandbox/lessons') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        note?: string
        parentId?: string
        labId?: string
        outcome?: string
      }
      if (!payload.note?.trim()) {
        json(res, 400, { ok: false, error: 'note required' })
        return true
      }
      const lesson = addLesson({
        note: payload.note,
        parentId: payload.parentId,
        labId: payload.labId,
        outcome: payload.outcome,
      })
      bookkeep('sandbox-lesson', { id: lesson.id })
      json(res, 200, { ok: true, lesson })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad lesson' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/implement') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const includeDone = url.searchParams.get('done') === '1'
    json(res, 200, listImplement(includeDone))
    return true
  }

  if (req.method === 'POST' && path === '/api/implement') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        title?: string
        note?: string
        status?: 'discuss' | 'will-implement' | 'implemented'
        related?: string[]
        supersedes?: string
      }
      if (!payload.title?.trim()) {
        json(res, 400, { ok: false, error: 'title required' })
        return true
      }
      const item = addImplement({
        title: payload.title,
        note: payload.note,
        status: payload.status,
        related: payload.related,
        supersedes: payload.supersedes,
      })
      bookkeep('implement', { id: item.id, status: item.status })
      json(res, 200, { ok: true, item })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad implement' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/implement/complete') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { id?: string }
      const item = payload.id ? completeImplement(payload.id) : null
      if (!item) {
        json(res, 404, { ok: false, error: 'implement item not found' })
        return true
      }
      bookkeep('implement-complete', { id: item.id })
      json(res, 200, { ok: true, item })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad complete' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/generate/seed') {
    try {
      const raw = await readBody(req)
      const payload = raw.length ? (JSON.parse(raw.toString('utf8')) as { paperId?: string }) : {}
      const seed = generateSeed(payload.paperId)
      json(res, seed.ok ? 200 : 404, seed)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad generate seed' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/bins') {
    json(res, 200, docsStatus())
    return true
  }

  if (req.method === 'POST' && path === '/api/docs/remove') {
    try {
      const raw = await readBody(req)
      const payload = raw.length ? (JSON.parse(raw.toString('utf8')) as { confirm?: boolean; phrase?: string }) : {}
      const result = removeDocWiki(payload)
      bookkeep('docs-remove', result)
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad docs remove' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/pages') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const project = url.searchParams.get('project') ?? ''
    const binRaw = (url.searchParams.get('bin') ?? 'all').toLowerCase()
    const all = listPages()
    const scoped = project ? pagesForProject(all, project) : all
    const pages = binRaw === 'boot' || binRaw === 'doc' ? pagesForBin(scoped, binRaw as PageBin) : scoped
    json(res, 200, {
      pages,
      tree: pageTree(pages),
      sandbox: groupSandboxPages(pages),
      project: project || null,
      bin: binRaw === 'boot' || binRaw === 'doc' ? binRaw : 'all',
      docs: docsStatus(),
    })
    return true
  }

  if (req.method === 'GET' && path.startsWith('/api/pages/')) {
    const slug = decodeURIComponent(path.slice('/api/pages/'.length)).replace(/\/$/, '')
    const page = loadPage(slug)
    if (!page) {
      json(res, 404, { ok: false, error: 'page not found' })
      return true
    }
    json(res, 200, page)
    return true
  }

  if (req.method === 'GET' && path === '/api/papers') {
    json(res, 200, { papers: listPapers() })
    return true
  }

  if (req.method === 'GET' && path === '/api/papers/db') {
    json(res, 200, loadPaperDb())
    return true
  }

  if (req.method === 'POST' && path === '/api/papers/db/rebuild') {
    const db = rebuildPaperDb()
    bookkeep('paper-db', { count: db.papers.length })
    json(res, 200, { ok: true, ...db })
    return true
  }

  if (req.method === 'GET' && path.startsWith('/api/papers/')) {
    const rest = decodeURIComponent(path.slice('/api/papers/'.length)).replace(/\/$/, '')
    if (rest === 'fetch' || rest === 'db') return false
    if (rest.endsWith('/pdf')) {
      const id = rest.slice(0, -'/pdf'.length)
      const abs = findPaperPdf(id)
      if (!abs || !existsSync(abs)) {
        json(res, 404, { ok: false, error: 'pdf not on disk' })
        return true
      }
      const buf = readFileSync(abs)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`)
      res.end(buf)
      return true
    }
    const rec = loadPaperRecord(rest)
    if (!rec) {
      json(res, 404, { ok: false, error: 'paper not found' })
      return true
    }
    json(res, 200, rec)
    return true
  }

  if (req.method === 'GET' && path === '/api/math') {
    json(res, 200, { terms: mathLexicon() })
    return true
  }

  if (req.method === 'GET' && path === '/api/diagrams') {
    json(res, 200, diagramsPayload())
    return true
  }

  if (req.method === 'GET' && path === '/api/execution') {
    json(res, 200, { papers: executionTable() })
    return true
  }

  if (req.method === 'GET' && path === '/api/maps') {
    json(res, 200, loadMaps())
    return true
  }

  if (req.method === 'POST' && path === '/api/maps/fetch') {
    try {
      const raw = await readBody(req)
      const payload = raw.length
        ? (JSON.parse(raw.toString('utf8')) as { q?: string; query?: string; kind?: 'math' | 'diagram' })
        : {}
      const q = payload.q ?? payload.query ?? ''
      const result = await fetchCodeForQuery(q, payload.kind ?? 'math')
      if (result.ok) bookkeep('map-fetch', { q, added: result.added.length })
      json(res, result.ok ? 200 : 400, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad map fetch' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/memory') {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const lane = url.searchParams.get('lane') as MemoryLane | null
    const includeForgotten = url.searchParams.get('forgotten') === '1'
    const includeSuperseded = url.searchParams.get('superseded') === '1'
    json(
      res,
      200,
      listMemory(lane === 'user' || lane === 'project' ? lane : undefined, includeForgotten, includeSuperseded),
    )
    return true
  }

  if (req.method === 'POST' && path === '/api/memory') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as {
        lane?: MemoryLane
        text?: string
        kind?: string
        halfLifeHours?: number
        supersedes?: string
      }
      if (payload.lane !== 'user' && payload.lane !== 'project') {
        json(res, 400, { ok: false, error: 'lane must be user or project' })
        return true
      }
      if (!payload.text?.trim()) {
        json(res, 400, { ok: false, error: 'text required' })
        return true
      }
      const item = remember({
        lane: payload.lane,
        text: payload.text,
        kind: payload.kind,
        halfLifeHours: payload.halfLifeHours,
        supersedes: payload.supersedes,
      })
      bookkeep('memory', { id: item.id, lane: item.lane, supersedes: item.supersedes })
      json(res, 200, { ok: true, item })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad memory' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/memory/touch') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { id?: string }
      const item = payload.id ? touchMemory(payload.id) : null
      if (!item) {
        json(res, 404, { ok: false, error: 'memory not found' })
        return true
      }
      json(res, 200, { ok: true, item })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad touch' })
    }
    return true
  }

  if (req.method === 'POST' && path === '/api/memory/forget') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { id?: string; why?: string }
      const item = payload.id ? forgetMemory(payload.id, payload.why) : null
      if (!item) {
        json(res, 404, { ok: false, error: 'memory not found' })
        return true
      }
      json(res, 200, { ok: true, item })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad forget' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/overview') {
    const binRaw = new URL(req.url ?? '/', 'http://127.0.0.1').searchParams.get('bin') ?? 'boot'
    const bin: PageBin = binRaw === 'doc' ? 'doc' : 'boot'
    json(res, 200, siteOverview(bin))
    return true
  }

  if (req.method === 'GET' && path === '/api/search') {
    const q = new URL(req.url ?? '/', 'http://127.0.0.1').searchParams.get('q') ?? ''
    const result = await hybridSearch(q, 8)
    json(res, result.ok ? 200 : 503, result)
    return true
  }

  if (req.method === 'GET' && path === '/api/demo') {
    const result = await loadDemo()
    json(res, 200, result)
    return true
  }

  if (req.method === 'GET' && path === '/api/projects') {
    json(res, 200, { projects: listProjects() })
    return true
  }

  if (req.method === 'GET' && path.startsWith('/api/projects/')) {
    const id = decodeURIComponent(path.slice('/api/projects/'.length)).replace(/\/$/, '')
    const payload = loadProject(id)
    if (!payload) {
      json(res, 404, { ok: false, error: 'project not found' })
      return true
    }
    json(res, 200, payload)
    return true
  }

  if (req.method === 'GET' && path === '/api/site') {
    const overview = loadPage('overview')
    const pages = pagesForBin(listPages(), 'boot')
    json(res, 200, {
      article: overview?.body ?? '',
      pages,
      tree: pageTree(pages),
      articlePath: overview?.path ?? 'data/md/overview.md',
      docs: docsStatus(),
    })
    return true
  }

  if (req.method === 'GET' && path === '/api/bookkeep') {
    json(res, 200, { events: readBookkeep() })
    return true
  }

  if (req.method === 'POST' && path === '/api/ask') {
    try {
      const raw = await readBody(req)
      const payload = raw.length ? (JSON.parse(raw.toString('utf8')) as { query?: string }) : {}
      const result = await runAsk(payload.query ?? '')
      let papers = { fetched: [] as string[], skipped: [] as string[], errors: [] as string[] }
      if (result.ok) {
        papers = await ensurePapersForDiagrams(loadAllDiagrams())
      }
      json(res, result.ok ? 200 : 503, { ...result, papers })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad ask' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/scripts') {
    json(res, 200, {
      scripts: SCRIPT_ALLOW.map((name) => ({ name, desc: scriptDesc(name) })),
    })
    return true
  }

  if (req.method === 'POST' && path === '/api/scripts') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as { name?: string; query?: string }
      const name = payload.name as ScriptName
      if (!SCRIPT_ALLOW.includes(name)) {
        json(res, 400, { ok: false, error: 'unknown script' })
        return true
      }
      const args = name === 'ask' && payload.query ? ['ask', '--query', payload.query] : [name]
      const result = await runRag(args, 240_000)
      bookkeep('script', { name, ok: result.ok })
      let papers: { fetched: string[]; skipped: string[]; errors: string[] } | undefined
      if (result.ok && name === 'ask') {
        papers = await ensurePapersForDiagrams(loadAllDiagrams())
      }
      json(res, result.ok ? 200 : 503, { ...result, name, papers })
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad script' })
    }
    return true
  }

  if (req.method === 'POST' && (path === '/api/fetch' || path === '/api/papers/fetch')) {
    try {
      const raw = await readBody(req)
      const payload = raw.length
        ? (JSON.parse(raw.toString('utf8')) as { url?: string; arxiv?: string; id?: string })
        : {}
      if (!payload.url && !payload.arxiv && !payload.id) {
        json(res, 400, { ok: false, error: 'arxiv id or OA url required' })
        return true
      }
      const saved = await fetchAndIngestPaper(payload)
      bookkeep('fetch', saved)
      json(res, 200, saved)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('bad fetch')
      const hint = 'hint' in err ? String((err as { hint?: string }).hint ?? '') : ''
      const status = /blocked host|only http/i.test(err.message)
        ? 403
        : /over \d+ bytes/i.test(err.message)
          ? 413
          : /index rebuild|rag /i.test(err.message)
            ? 503
            : /fetch \d+|host lookup|not an OA/i.test(err.message)
              ? 502
              : 400
      json(res, status, { ok: false, error: err.message, hint: hint || undefined })
    }
    return true
  }

  return false
}
