import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { bookkeep } from '../persist/bookkeep.ts'
import { mergeParkMeta, type ParkBoardMeta } from '../persist/boards.ts'
import { inboxDir } from '../paths.ts'
import { runAsk } from '../retrieve/hybrid.ts'

function countShapes(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== 'object') return 0
  const document = (snapshot as { document?: { store?: Record<string, { typeName?: string }> } }).document
  const store = document?.store
  if (!store) return 0
  return Object.values(store).filter((record) => record?.typeName === 'shape').length
}

export type SnapshotPayload = {
  savedAt?: string
  parked?: boolean
  snapshot?: unknown
  transcript?: string
  pngBase64?: string
  /** Tie to a site artifact. Autosave may send this; it never applies MD. */
  meta?: ParkBoardMeta
}

export async function writeInboxSnapshot(payload: SnapshotPayload, rawBytes: number) {
  mkdirSync(inboxDir, { recursive: true })
  const incomingShapes = countShapes(payload.snapshot)
  if (!payload.parked && incomingShapes === 0) {
    const existing = join(inboxDir, 'latest.json')
    if (existsSync(existing) && statSync(existing).size < 400_000) {
      try {
        const prev = JSON.parse(readFileSync(existing, 'utf8')) as { snapshot?: unknown }
        if (countShapes(prev.snapshot) > 0) {
          return { ok: true as const, skipped: 'empty-autosave' }
        }
      } catch {
        // Replace unreadable inbox.
      }
    }
  }

  const { pngBase64, transcript, ...record } = payload
  writeFileSync(join(inboxDir, 'latest.json'), `${JSON.stringify(record)}\n`, 'utf8')
  if (typeof transcript === 'string') {
    writeFileSync(join(inboxDir, 'message.md'), `${transcript.trim()}\n`, 'utf8')
  }
  if (typeof pngBase64 === 'string' && pngBase64.length > 0) {
    writeFileSync(join(inboxDir, 'latest.png'), Buffer.from(pngBase64, 'base64'))
  }
  writeFileSync(
    join(inboxDir, 'meta.json'),
    `${JSON.stringify(
      mergeParkMeta(
        {
          savedAt: payload.savedAt ?? new Date().toISOString(),
          parked: Boolean(payload.parked),
          bytes: rawBytes,
          hasPng: Boolean(payload.pngBase64),
          liveWrite: false,
        },
        payload.meta,
      ),
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

  return { ok: true as const, ask: payload.parked ? 'started' : undefined }
}
