import { AssetRecordType, type Editor } from 'tldraw'
import { apiUrl } from '../api'
import type { TiedBoard } from '../site/types'
import { canStampBoard, type StampPayload } from './stampGuard'

export { canStampBoard, type StampPayload } from './stampGuard'

const STAMP_META = 'boardStamp'
const inFlight = new WeakSet<Editor>()

export function alreadyStamped(editor: Editor, boardId: string) {
  return editor.getCurrentPageShapes().some((shape) => shape.meta?.[STAMP_META] === boardId)
}

function assetHref(boardId: string, file: string) {
  const q = new URLSearchParams({ id: boardId, name: file })
  return apiUrl(`/api/boards/file?${q.toString()}`)
}

async function asDataUrl(src: string): Promise<string | null> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(src, { signal: ctrl.signal, cache: 'no-store' })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.size) return null
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('read failed'))
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

/** Place board JPEGs/PNGs on this editor. Retry-safe: no-op if already present. */
export async function stampBoardImages(editor: Editor, board: TiedBoard, payload: StampPayload) {
  if (!canStampBoard(payload, board)) return
  if (alreadyStamped(editor, board.id) || inFlight.has(editor)) return
  const images = (board.assets ?? []).filter((a) => a.kind === 'image')
  if (!images.length) return
  inFlight.add(editor)

  try {
    let y = 0
    const gap = 48
    const targetW = 1100
    const created: string[] = []
    for (const asset of images) {
      const href = assetHref(board.id, asset.file)
      const src = await asDataUrl(href)
      if (!src) return
      const w = asset.w || targetW
      const h = asset.h || 1400
      const scaledW = targetW
      const scaledH = Math.round(h * (targetW / w))
      const assetId = AssetRecordType.createId()
      editor.createAssets([
        {
          id: assetId,
          typeName: 'asset',
          type: 'image',
          meta: {},
          props: {
            name: asset.file,
            src,
            w,
            h,
            mimeType: asset.mime || 'image/jpeg',
            isAnimated: false,
          },
        } as Parameters<Editor['createAssets']>[0][number],
      ])
      editor.createShape({
        type: 'image',
        x: 0,
        y,
        isLocked: false,
        meta: { [STAMP_META]: board.id, assetFile: asset.file },
        props: {
          assetId,
          w: scaledW,
          h: scaledH,
          playing: false,
          url: '',
          crop: null,
        },
      } as Parameters<Editor['createShape']>[0])
      y += scaledH + gap
    }
    const ids = editor.getCurrentPageShapes().filter((s) => s.meta?.[STAMP_META] === board.id).map((s) => s.id)
    if (ids.length) {
      editor.sendToBack(ids)
      editor.updateShapes(ids.map((id) => ({ id, type: 'image', isLocked: true })))
      created.push(...ids)
    }
    if (created.length) editor.zoomToFit({ animation: { duration: 0 } })
  } finally {
    inFlight.delete(editor)
  }
}
