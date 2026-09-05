import type { Editor } from 'tldraw'
import { apiUrl } from '../api'
import { canvasTranscript } from './transcript'

async function canvasPngBase64(editor: Editor) {
  const ids = [...editor.getCurrentPageShapeIds()]
  if (ids.length === 0) return undefined
  const { blob } = await editor.toImage(ids, { format: 'png', background: true, padding: 32, scale: 2 })
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

let snapshotInFlight = false

export async function parkSnapshot(editor: Editor, opts: { parked?: boolean; includeImage?: boolean } = {}) {
  const parked = Boolean(opts.parked)
  const shapeCount = editor.getCurrentPageShapeIds().size
  if (!parked && shapeCount === 0) return
  if (snapshotInFlight && !parked) return

  const includeImage = opts.includeImage ?? (parked || shapeCount > 0)
  snapshotInFlight = true
  try {
    const snapshot = editor.getSnapshot()
    const pngBase64 = includeImage && shapeCount > 0 ? await canvasPngBase64(editor) : undefined
    const response = await fetch(apiUrl('/api/snapshot'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        savedAt: new Date().toISOString(),
        parked,
        snapshot,
        transcript: canvasTranscript(editor),
        pngBase64,
      }),
    })
    if (!response.ok) {
      throw new Error(`snapshot ${response.status}`)
    }
  } finally {
    snapshotInFlight = false
  }
}
