# server/inbox-plugin.ts

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { bookkeep, readBookkeep } from './bookkeep'
import { fetchIntoPapers } from './fetch-safe'
import { ensureDataDirs } from './paths'
import { SCRIPT_ALLOW, runRag, type ScriptName } from './rag-runner'
import { hybridSearch, loadSite, runAsk } from './vector-store'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const inboxDir = join(root, 'inbox')

type Res = ServerResponse

function json(res: Res, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function countShapes(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== 'object') return 0
  const document = (snapshot as { document?: { store?: Record<string, { typeName?: string }> } }).document
  const store = document?.store
  if (!store) return 0
  return Object.values(store).filter((record) => record?.typeName === 'shape').length
}

type FileNode = {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: FileNode[]
}

const SKIP_NAMES = new Set(['node_modules', '.git', 'dist'])

function keepListingName(name: string) {
  if (SKIP_NAMES.has(name)) return false
  if (name === '.' || name === '..') return false
  if (name.startsWith('.') && name !== '.cursor' && name !== '.gitignore' && name !== '.cursorignore') {
    return false
  }
  return true
}

function walkFiles(absDir: string, rel: string): FileNode[] {
  let entries
  try {
    entries = readdirSync(absDir, { withFileTypes: true })
  } catch {
    return []
  }
  const nodes: FileNode[] = []
  for (const entry of entries) {
    if (!keepListingName(entry.name)) continue
    const path = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path,
        type: 'dir',
        children: walkFiles(join(absDir, entry.name), path),
      })
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      nodes.push({ name: entry.name, path, type: 'file' })
    }
  }
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

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

export function inboxPlugin(): Plugin {
  return {
    name: 'ipad-inbox',
    configureServer(server) {
      mkdirSync(inboxDir, { recursive: true })
      ensureDataDirs()
      const port = server.config.server.port ?? 5174

      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        if (path === '/site' || path === '/site/') {
          req.url = '/index.html'
        }
        next()
      })

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next()
          return
        }

        if (req.method === 'GET' && req.url === '/api/health') {
          json(res, 200, { ok: true, inbox: inboxDir, urls: lanUrls(port) })
          return
        }

        if (req.method === 'GET' && req.url === '/api/pair') {
          json(res, 200, { urls: lanUrls(port) })
          return
        }

        if (req.method === 'GET' && req.url === '/api/files') {
          json(res, 200, { root: 'Drawinng-Local-Website-Loop', tree: walkFiles(root, '') })
          return
        }

        if (req.method === 'POST' && req.url === '/api/snapshot') {
          try {
            const raw = await readBody(req)
            const payload = JSON.parse(raw.toString('utf8')) as {
              savedAt?: string
              parked?: boolean
              snapshot?: unknown
              transcript?: string
              pngBase64?: string
            }
            const { pngBase64, transcript, ...record } = payload
            const incomingShapes = countShapes(payload.snapshot)
            if (!payload.parked && incomingShapes === 0) {
              const existing = join(inboxDir, 'latest.json')
              if (existsSync(existing)) {
                try {
                  const prev = JSON.parse(readFileSync(existing, 'utf8')) as { snapshot?: unknown }
                  if (countShapes(prev.snapshot) > 0) {
                    json(res, 200, { ok: true, skipped: 'empty-autosave' })
                    return
                  }
                } catch {
                  // Replace unreadable inbox.
                }
              }
            }
            writeFileSync(join(inboxDir, 'latest.json'), `${JSON.stringify(record, null, 2)}\n`, 'utf8')
            if (typeof transcript === 'string') {
              writeFileSync(join(inboxDir, 'message.md'), `${transcript.trim()}\n`, 'utf8')
            }
            if (typeof pngBase64 === 'string' && pngBase64.length > 0) {
              writeFileSync(join(inboxDir, 'latest.png'), Buffer.from(pngBase64, 'base64'))
            }
            writeFileSync(
              join(inboxDir, 'meta.json'),
              `${JSON.stringify(
                {
                  savedAt: payload.savedAt ?? new Date().toISOString(),
                  parked: Boolean(payload.parked),
                  bytes: raw.length,
                  hasPng: Boolean(payload.pngBase64),
                },
                null,
                2,
              )}\n`,
              'utf8',
            )
            if (payload.parked) {
              writeFileSync(join(inboxDir, 'PENDING'), `${payload.savedAt ?? new Date().toISOString()}\n`, 'utf8')
              bookkeep('park', { savedAt: payload.savedAt, shapes: incomingShapes })
              void runAsk('parked canvas architecture').then((ask) => {
                bookkeep('ask', { via: 'park', ok: ask.ok, error: ask.error ?? null })
              })
            }
            json(res, 200, { ok: true, ask: payload.parked ? 'started' : undefined })
          } catch (error) {
            json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad snapshot' })
          }
          return
        }

        if (req.method === 'GET' && req.url.startsWith('/api/search')) {
          const q = new URL(req.url, 'http://127.0.0.1').searchParams.get('q') ?? ''
          const result = await hybridSearch(q, 8)
          json(res, result.ok ? 200 : 503, result)
          return
        }

        if (req.method === 'GET' && req.url === '/api/site') {
          const result = await loadSite()
          if (!result.ok) {
            json(res, 503, result)
            return
          }
          json(res, 200, result.data)
          return
        }

        if (req.method === 'GET' && req.url === '/api/bookkeep') {
          json(res, 200, { events: readBookkeep() })
          return
        }

        if (req.method === 'POST' && req.url === '/api/ask') {
          try {
            const raw = await readBody(req)
            const payload = raw.length
              ? (JSON.parse(raw.toString('utf8')) as { query?: string })
              : {}
            const result = await runAsk(payload.query ?? '')
            json(res, result.ok ? 200 : 503, result)
          } catch (error) {
            json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad ask' })
          }
          return
        }

        if (req.method === 'GET' && req.url === '/api/scripts') {
          json(res, 200, {
            scripts: SCRIPT_ALLOW.map((name) => ({
              name,
              desc:
                name === 'seed'
                  ? 'Ingest architecture + handbook + drop folders'
                  : name === 'rebuild'
                    ? 'Rebuild Chroma+BM25 indexes'
                    : name === 'ask'
                      ? 'Ingest scribble and write md + diagram'
                      : 'Print latest site payload',
            })),
          })
          return
        }

        if (req.method === 'POST' && req.url === '/api/scripts') {
          try {
            const raw = await readBody(req)
            const payload = JSON.parse(raw.toString('utf8')) as { name?: string; query?: string }
            const name = payload.name as ScriptName
            if (!SCRIPT_ALLOW.includes(name)) {
              json(res, 400, { ok: false, error: 'unknown script' })
              return
            }
            const args = name === 'ask' && payload.query ? ['ask', '--query', payload.query] : [name]
            const result = await runRag(args, 240_000)
            bookkeep('script', { name, ok: result.ok })
            json(res, result.ok ? 200 : 503, { ...result, name })
          } catch (error) {
            json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad script' })
          }
          return
        }

        if (req.method === 'POST' && req.url === '/api/fetch') {
          try {
            const raw = await readBody(req)
            const payload = JSON.parse(raw.toString('utf8')) as { url?: string }
            if (!payload.url) {
              json(res, 400, { ok: false, error: 'url required' })
              return
            }
            const saved = await fetchIntoPapers(payload.url)
            bookkeep('fetch', saved)
            json(res, 200, saved)
          } catch (error) {
            json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad fetch' })
          }
          return
        }

        next()
      })
    },
  }
}
