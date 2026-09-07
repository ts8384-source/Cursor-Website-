import { createServer } from 'node:http'
import { mkdirSync } from 'node:fs'
import { applyCors, json } from './http/io.ts'
import { handleApi } from './http/routes.ts'
import { startWatchdog } from './http/watchdog.ts'
import { backendPort, ensureDataDirs, inboxDir } from './paths.ts'

ensureDataDirs()
mkdirSync(inboxDir, { recursive: true })
startWatchdog(20_000)

const server = createServer({ keepAlive: false, noDelay: true }, async (req, res) => {
  applyCors(res)
  req.on('aborted', () => {
    if (!res.writableEnded) res.end()
  })
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  try {
    const handled = await handleApi(req, res)
    if (!handled) json(res, 404, { ok: false, error: 'not found' })
  } catch (error) {
    if (!res.headersSent) {
      json(res, 500, { ok: false, error: error instanceof Error ? error.message : 'server error' })
    }
  }
})

server.maxConnections = 32
server.requestTimeout = 400_000
server.headersTimeout = 8_000
server.timeout = 400_000
server.keepAliveTimeout = 1_000

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`backend port ${backendPort} already in use — refuse a second API. Keep one :5175.`)
    process.exit(1)
  }
  throw err
})

server.listen(backendPort, '0.0.0.0', () => {
  console.log(`backend http://127.0.0.1:${backendPort}  (pad proxy: Vite :5174 /api)`)
})
