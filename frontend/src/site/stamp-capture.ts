const CAPTURE_MS = 4_000
const MAX_WIDTH = 1_600
const MAX_BYTES = 1_500_000

function withTimeout<T>(work: Promise<T>, ms = CAPTURE_MS): Promise<T | null> {
  return new Promise((resolve) => {
    let done = false
    const timer = window.setTimeout(() => {
      if (done) return
      done = true
      resolve(null)
    }, ms)
    work
      .then((value) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        resolve(null)
      })
  })
}

function payloadBytes(dataUrl: string) {
  const comma = dataUrl.indexOf(',')
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  return Math.floor((b64.length * 3) / 4)
}

function pick(selector?: string, fallbacks: string[] = []) {
  const list = [selector, ...fallbacks].filter(Boolean) as string[]
  for (const sel of list) {
    const matches = document.querySelectorAll(sel)
    for (const node of matches) {
      if (!(node instanceof HTMLElement)) continue
      if (node.offsetWidth <= 8 || node.offsetHeight <= 8) continue
      if (node.getAttribute('data-ipad-export') === 'diagram') {
        const ready = node.querySelector('.react-flow__node') as HTMLElement | null
        if (!ready || ready.offsetWidth < 4) continue
      }
      return node
    }
  }
  return null
}

async function waitForExport(selector?: string, fallbacks: string[] = [], ms = 1_200) {
  const start = Date.now()
  let el = pick(selector, fallbacks)
  while (!el && Date.now() - start < ms) {
    await new Promise((resolve) => window.setTimeout(resolve, 80))
    el = pick(selector, fallbacks)
  }
  return el
}

async function shrinkJpeg(dataUrl: string): Promise<{ imageBase64: string; w: number; h: number } | null> {
  const img = new Image()
  const loaded = await withTimeout(
    new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('image'))
      img.src = dataUrl
    }),
    2_000,
  )
  if (!loaded) return null
  const scale = loaded.naturalWidth > MAX_WIDTH ? MAX_WIDTH / loaded.naturalWidth : 1
  const w = Math.max(1, Math.round(loaded.naturalWidth * scale))
  const h = Math.max(1, Math.round(loaded.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#fffef8'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(loaded, 0, 0, w, h)
  let q = 0.82
  let out = canvas.toDataURL('image/jpeg', q)
  while (payloadBytes(out) > MAX_BYTES && q > 0.42) {
    q -= 0.1
    out = canvas.toDataURL('image/jpeg', q)
  }
  if (payloadBytes(out) > MAX_BYTES) return null
  return { imageBase64: out, w, h }
}

function skipChrome(node: Node) {
  if (!(node instanceof Element)) return true
  return !node.closest('.react-flow__minimap, .react-flow__controls, .react-flow__panel, .graph-canvas-bar, .open-ipad')
}

async function rasterElement(el: HTMLElement): Promise<string | null> {
  const modern = await withTimeout(
    import('modern-screenshot').then(({ domToJpeg }) =>
      domToJpeg(el, {
        quality: 0.82,
        scale: 1,
        timeout: CAPTURE_MS,
        backgroundColor: '#fffef8',
        filter: skipChrome,
      }),
    ),
    2_400,
  )
  if (modern) return modern
  return withTimeout(
    import('html2canvas').then(({ default: html2canvas }) =>
      html2canvas(el, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#fffef8',
        ignoreElements: (node) =>
          Boolean(node.closest?.('.react-flow__minimap, .react-flow__controls, .react-flow__panel, .graph-canvas-bar, .open-ipad')),
      }).then((canvas) => canvas.toDataURL('image/jpeg', 0.82)),
    ),
    2_400,
  )
}

export async function captureDiagramImage(selector?: string): Promise<{ imageBase64: string; w: number; h: number } | null> {
  const el = await waitForExport(selector, ['[data-ipad-export="diagram"]', '.graph-canvas-stage'])
  if (!el) return null
  const shot = await rasterElement(el)
  if (!shot) return null
  return shrinkJpeg(shot)
}

export async function captureArticlePdf(selector?: string): Promise<{ pdfBase64: string } | null> {
  const el = await waitForExport(selector, ['[data-ipad-export="page"]', '.site-article-body', '.site-article'])
  if (!el) return null
  const built = await withTimeout(
    (async () => {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
      const canvas = await html2canvas(el, {
        scale: 1.1,
        useCORS: true,
        logging: false,
        backgroundColor: '#fffef8',
        windowWidth: Math.min(el.scrollWidth, 900),
        height: Math.min(el.scrollHeight, 9_000),
        ignoreElements: (node) =>
          Boolean(
            node.closest?.(
              '.react-flow, .graph-canvas, .open-ipad, .loop-board, .site-rail, .fetch-form, .paper-list',
            ),
          ),
      })
      const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 28
      const usableW = pageW - margin * 2
      const usableH = pageH - margin * 2
      const scale = usableW / canvas.width
      const sliceH = usableH / scale
      let y = 0
      let page = 0
      while (y < canvas.height && page < 8) {
        const h = Math.min(sliceH, canvas.height - y)
        const slice = document.createElement('canvas')
        slice.width = canvas.width
        slice.height = Math.max(1, Math.round(h))
        const ctx = slice.getContext('2d')
        if (!ctx) break
        ctx.fillStyle = '#fffef8'
        ctx.fillRect(0, 0, slice.width, slice.height)
        ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, slice.height)
        const jpeg = slice.toDataURL('image/jpeg', 0.78)
        if (page) pdf.addPage()
        pdf.addImage(jpeg, 'JPEG', margin, margin, usableW, slice.height * scale)
        y += h
        page += 1
      }
      return pdf.output('datauristring') as string
    })(),
  )
  if (!built || payloadBytes(built) > MAX_BYTES) return null
  return { pdfBase64: built }
}

export { CAPTURE_MS, MAX_BYTES, MAX_WIDTH }
