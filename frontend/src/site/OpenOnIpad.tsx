import { useState } from 'react'
import { apiUrl } from '../api'
import { captureArticlePdf, captureDiagramImage } from './stamp-capture'
import type { BoardSourceType, BoardSurface, TiedBoard } from './types'

function stampedLabel(sourceType: BoardSourceType) {
  if (sourceType === 'paper') return 'Open on iPad (with paper)'
  if (sourceType === 'diagram' || sourceType === 'node') return 'Open on iPad (with diagram)'
  if (sourceType === 'math') return 'Open on iPad (with math)'
  return 'Open on iPad (with page)'
}

function padUrl(urls?: string[], pad?: string) {
  return pad || urls?.[0] || 'http://100.107.135.79:5174/'
}

export function OpenOnIpad({
  sourceType,
  sourceId,
  sourceSlug,
  title,
  pageId,
  paperIds,
  related,
  citations,
  gist,
  capture,
}: {
  sourceType: BoardSourceType
  sourceId: string
  sourceSlug?: string
  title?: string
  pageId?: string
  paperIds?: string[]
  related?: string[]
  citations?: string[]
  gist?: string
  capture?: string
}) {
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (surface: BoardSurface) => {
    setBusy(true)
    setErr('')
    setStatus('Sending…')
    try {
      let imageBase64: string | undefined
      let pdfBase64: string | undefined
      let w: number | undefined
      let h: number | undefined
      let captured = false
      if (surface === 'stamped' && sourceType !== 'paper') {
        if (sourceType === 'diagram' || sourceType === 'node') {
          const shot = await captureDiagramImage(capture)
          if (shot) {
            imageBase64 = shot.imageBase64
            w = shot.w
            h = shot.h
            captured = true
          }
        } else if (sourceType === 'page') {
          const pdf = await captureArticlePdf(capture)
          if (pdf) {
            pdfBase64 = pdf.pdfBase64
            captured = true
          }
        }
      } else if (surface === 'stamped' && sourceType === 'paper') {
        captured = true
      }
      const res = await fetch(apiUrl('/api/boards'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceId,
          sourceSlug,
          title,
          pageId,
          paperIds,
          related,
          citations,
          gist,
          surface,
          imageBase64,
          pdfBase64,
          w,
          h,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        board?: TiedBoard
        padOnline?: boolean
        urls?: string[]
        padUrl?: string
        error?: string
      }
      if (!res.ok || !data.board) {
        setErr(data.error || 'could not send to iPad')
        setStatus('')
        return
      }
      const safari = padUrl(data.urls, data.padUrl)
      const kind = data.board.assets?.[0]?.mime || ''
      const note =
        surface === 'clean'
          ? 'clean board'
          : captured
            ? kind.includes('jpeg') || kind.includes('jpg')
              ? 'diagram JPEG'
              : kind.includes('pdf') || kind.includes('png')
                ? 'page/paper image'
                : 'captured'
            : 'no capture — SVG fallback'
      setStatus(`Sent (${note}) — refresh the Safari pad if it doesn’t appear (${safari})`)
    } catch {
      setErr('could not reach the pad API')
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="open-ipad">
      <button type="button" className="open-ipad-btn" disabled={busy} onClick={() => void send('clean')}>
        Open on iPad (clean)
      </button>
      <button type="button" className="open-ipad-btn open-ipad-btn-stamp" disabled={busy} onClick={() => void send('stamped')}>
        {stampedLabel(sourceType)}
      </button>
      {status ? (
        <p className="site-status" role="status">
          {status}
        </p>
      ) : null}
      {err ? (
        <p className="site-error" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  )
}
