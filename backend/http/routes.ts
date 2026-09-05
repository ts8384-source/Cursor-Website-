import { networkInterfaces } from 'node:os'
import type { IncomingMessage } from 'node:http'
import { repoTree } from '../ingest/files.ts'
import { fetchAndIngestPaper } from '../ingest/paper-fetch.ts'
import { writeInboxSnapshot, type SnapshotPayload } from '../ingest/snapshot.ts'
import { inboxDir, padPort } from '../paths.ts'
import { bookkeep, readBookkeep } from '../persist/bookkeep.ts'
import { siteOverview } from '../persist/overview.ts'
import { listPages, loadPage } from '../persist/pages.ts'
import { listPapers } from '../persist/papers-catalog.ts'
import { listProjects, loadProject } from '../persist/projects.ts'
import { toolCatalog } from '../persist/tool-catalog.ts'
import { loadDemo } from '../retrieve/demo.ts'
import { hybridSearch, runAsk } from '../retrieve/hybrid.ts'
import { SCRIPT_ALLOW, runRag, type ScriptName } from '../scripts/runner.ts'
import { json, pathname, readBody, type Res } from './io.ts'

function lanUrls(port: number) {
  const urls: string[] = []
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue
      urls.push(`http://${addr.address}:${port}/`)
    }
  }
  return urls
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
    json(res, 200, { ok: true, inbox: inboxDir, padPort, urls: lanUrls(padPort) })
    return true
  }

  if (req.method === 'GET' && path === '/api/pair') {
    json(res, 200, { urls: lanUrls(padPort) })
    return true
  }

  if (req.method === 'GET' && path === '/api/files') {
    json(res, 200, repoTree())
    return true
  }

  if (req.method === 'POST' && path === '/api/snapshot') {
    try {
      const raw = await readBody(req)
      const payload = JSON.parse(raw.toString('utf8')) as SnapshotPayload
      const result = await writeInboxSnapshot(payload, raw.length)
      json(res, 200, result)
    } catch (error) {
      json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad snapshot' })
    }
    return true
  }

  if (req.method === 'GET' && path === '/api/tools') {
    json(res, 200, toolCatalog())
    return true
  }

  if (req.method === 'GET' && path === '/api/pages') {
    json(res, 200, { pages: listPages() })
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

  if (req.method === 'GET' && path === '/api/overview') {
    json(res, 200, siteOverview())
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
    json(res, 200, {
      article: overview?.body ?? '',
      pages: listPages(),
      articlePath: overview?.path ?? 'data/md/overview.md',
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
      json(res, result.ok ? 200 : 503, result)
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
      json(res, result.ok ? 200 : 503, { ...result, name })
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
