import { apiUrl } from '../api'

export type UploadAsset = {
  file: string
  mime: string
  base64: string
  w: number
  h: number
}

function dataUrlToAsset(dataUrl: string, file: string): UploadAsset | null {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl)
  if (!m) return null
  return { file, mime: m[1], base64: m[2], w: 1100, h: 1500 }
}

/** Snapshot the visible article/diagram (handbook 14: show the graphic, not a caption-only stand-in). */
export async function rasterizeSelector(selector?: string): Promise<UploadAsset[]> {
  if (!selector || typeof document === 'undefined') return []
  const el = document.querySelector(selector) as HTMLElement | null
  if (!el) return []
  const w = Math.min(1400, Math.max(el.scrollWidth, el.clientWidth, 400))
  const h = Math.min(2400, Math.max(el.scrollHeight, el.clientHeight, 200))
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.open-ipad').forEach((n) => n.remove())
  const html = new XMLSerializer().serializeToString(clone)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;background:#fffef8;color:#1a1814;font:18px/1.45 Georgia,serif;padding:16px;box-sizing:border-box;">${html}</div>
    </foreignObject>
  </svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('raster failed'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    const scale = Math.min(2, 1600 / w)
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return []
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const asset = dataUrlToAsset(canvas.toDataURL('image/png'), 'page-01.png')
    if (!asset) return []
    asset.w = canvas.width
    asset.h = canvas.height
    return [asset]
  } catch {
    return []
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function rasterizePaperPdf(paperId: string): Promise<UploadAsset[]> {
  const res = await fetch(apiUrl(`/api/papers/${encodeURIComponent(paperId)}/pdf`))
  if (!res.ok) return []
  const buf = await res.arrayBuffer()
  try {
    const pdfjs = await import('pdfjs-dist')
    const worker = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
    pdfjs.GlobalWorkerOptions.workerSrc = worker.toString()
    const doc = await pdfjs.getDocument({ data: buf }).promise
    const max = Math.min(doc.numPages, 8)
    const out: UploadAsset[] = []
    let bytes = 0
    for (let i = 1; i <= max; i += 1) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 1.35 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (!ctx) break
      await page.render({ canvasContext: ctx, viewport }).promise
      const dataUrl = canvas.toDataURL('image/png')
      const asset = dataUrlToAsset(dataUrl, `page-${String(i).padStart(2, '0')}.png`)
      if (!asset) continue
      asset.w = canvas.width
      asset.h = canvas.height
      const size = Math.ceil((asset.base64.length * 3) / 4)
      if (bytes + size > 8 * 1024 * 1024 && out.length) break
      bytes += size
      out.push(asset)
    }
    return out
  } catch {
    return []
  }
}
