import type { IncomingMessage, ServerResponse } from 'node:http'

export type Res = ServerResponse

export function json(res: Res, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Connection', 'close')
  res.end(JSON.stringify(body))
}

export function readBody(req: IncomingMessage, maxBytes = 4_000_000, timeoutMs = 8_000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    let done = false
    const timer = setTimeout(() => {
      req.destroy()
      finish(new Error('request body timed out'))
    }, timeoutMs)
    const finish = (err?: Error, buf?: Buffer) => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (err) reject(err)
      else resolve(buf ?? Buffer.alloc(0))
    }
    req.on('data', (chunk) => {
      const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
      size += buf.length
      if (size > maxBytes) {
        req.destroy()
        finish(new Error('request body too large'))
        return
      }
      chunks.push(buf)
    })
    req.on('end', () => finish(undefined, Buffer.concat(chunks)))
    req.on('aborted', () => finish(new Error('request aborted')))
    req.on('error', (err) => finish(err))
  })
}

export function applyCors(res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Connection', 'close')
}

export function pathname(req: IncomingMessage) {
  return (req.url ?? '/').split('?')[0] ?? '/'
}

export function queryParams(req: IncomingMessage) {
  const raw = req.url ?? ''
  const q = raw.indexOf('?')
  return new URLSearchParams(q >= 0 ? raw.slice(q + 1) : '')
}
