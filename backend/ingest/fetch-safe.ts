import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

export const MAX_PDF_BYTES = 20_000_000
export const MAX_MD_CHARS = 400_000
export const FETCH_TIMEOUT_MS = 20_000

const BLOCKED_HOST =
  /^(localhost|metadata\.google\.internal|metadata\.goog|.*\.internal|.*\.local)$/i

export function isBlockedIp(ip: string): boolean {
  const raw = ip.trim().toLowerCase().replace(/^\[|\]$/g, '')
  if (raw === '::1' || raw === '0:0:0:0:0:0:0:1') return true
  if (raw.startsWith('fe80:') || raw.startsWith('fc') || raw.startsWith('fd')) return true
  if (raw.startsWith('::ffff:')) return isBlockedIp(raw.slice(7))

  const parts = raw.split('.').map((p) => Number(p))
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return raw === 'localhost'
  }
  const [a, b] = parts
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  if (a === 198 && (b === 18 || b === 19)) return true
  return false
}

export function parseHttpUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error('invalid url')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('only http(s)')
  }
  if (url.username || url.password) {
    throw new Error('blocked host')
  }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (BLOCKED_HOST.test(host) || host === 'localhost') {
    throw new Error('blocked host')
  }
  if (isIP(host) && isBlockedIp(host)) {
    throw new Error('blocked host')
  }
  return url
}

export async function assertSafeResolved(url: URL): Promise<void> {
  parseHttpUrl(url.href)
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (isIP(host)) {
    if (isBlockedIp(host)) throw new Error('blocked host')
    return
  }
  let addrs: { address: string }[]
  try {
    addrs = await lookup(host, { all: true, verbatim: true })
  } catch {
    throw new Error('host lookup failed')
  }
  if (!addrs.length) throw new Error('host lookup failed')
  for (const row of addrs) {
    if (isBlockedIp(row.address)) throw new Error('blocked host')
  }
}

export function isArxivHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return (
    h === 'arxiv.org' ||
    h === 'www.arxiv.org' ||
    h === 'export.arxiv.org' ||
    h === 'ar5iv.labs.arxiv.org' ||
    h.endsWith('.arxiv.org')
  )
}

/** arXiv id like 2407.01449 or 2303.14334v2 */
export function parseArxivId(raw: string): string | null {
  const text = raw.trim()
  const fromUrl =
    /arxiv\.org\/(?:abs|pdf|html|src)\/(\d{4}\.\d{4,5}(?:v\d+)?)/i.exec(text) ||
    /ar5iv\.labs\.arxiv\.org\/html\/(\d{4}\.\d{4,5}(?:v\d+)?)/i.exec(text)
  if (fromUrl) return fromUrl[1].replace(/v\d+$/i, '')
  const bare = /^(?:arxiv:)?(\d{4}\.\d{4,5})(?:v\d+)?$/i.exec(text)
  return bare ? bare[1] : null
}

export function arxivPdfUrl(id: string): string {
  return `https://arxiv.org/pdf/${id}.pdf`
}

export function arxivAbsUrl(id: string): string {
  return `https://arxiv.org/abs/${id}`
}

export function arxivApiUrl(id: string): string {
  return `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`
}

export async function safeGet(
  raw: string,
  maxBytes = MAX_PDF_BYTES,
): Promise<{ url: string; status: number; contentType: string; body: Buffer }> {
  let current = parseHttpUrl(raw)
  for (let hop = 0; hop < 6; hop += 1) {
    await assertSafeResolved(current)
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'drawing-loop-oa-fetch/1.0 (local research ingest; OA only)' },
    })
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) throw new Error(`fetch ${res.status}`)
      current = new URL(loc, current)
      continue
    }
    if (!res.ok) throw new Error(`fetch ${res.status}`)
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    const declared = Number(res.headers.get('content-length') || 0)
    if (declared > maxBytes) throw new Error(`over ${maxBytes} bytes`)
    const reader = res.body?.getReader()
    if (!reader) {
      const body = Buffer.from(await res.arrayBuffer())
      if (body.length > maxBytes) throw new Error(`over ${maxBytes} bytes`)
      return { url: current.href, status: res.status, contentType, body }
    }
    const chunks: Buffer[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel()
        throw new Error(`over ${maxBytes} bytes`)
      }
      chunks.push(Buffer.from(value))
    }
    return { url: current.href, status: res.status, contentType, body: Buffer.concat(chunks) }
  }
  throw new Error('too many redirects')
}

/** Best-effort uncompressed PDF strings; arXiv API abstract is the fallback. */
export function extractPdfStrings(buf: Buffer, maxChars = MAX_MD_CHARS): string {
  const raw = buf.toString('latin1')
  const bits: string[] = []
  const re = /\(((?:\\.|[^\\)]){4,})\)\s*Tj/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    const text = m[1]
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\(.)/g, '$1')
    if (/[A-Za-z]{3}/.test(text)) bits.push(text)
    if (bits.join(' ').length > maxChars) break
  }
  return bits.join(' ').replace(/\s+/g, ' ').trim().slice(0, maxChars)
}
