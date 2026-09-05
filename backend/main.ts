import { createServer } from 'node:http'
import { mkdirSync } from 'node:fs'
import { applyCors, json } from './http/io.ts'
import { handleApi } from './http/routes.ts'
import { backendPort, ensureDataDirs, inboxDir } from './paths.ts'

ensureDataDirs()
mkdirSync(inboxDir, { recursive: true })

const server = createServer(async (req, res) => {
  applyCors(res)
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

server.listen(backendPort, '0.0.0.0', () => {
  console.log(`backend http://127.0.0.1:${backendPort}  (pad proxy: Vite :5174 /api)`)
})
