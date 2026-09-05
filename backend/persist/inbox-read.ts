import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inboxDir } from '../paths.ts'

export type InboxPark = {
  savedAt: string | null
  parked: boolean
  hasPng: boolean
  messagePreview: string
}

export function readInboxPark(): InboxPark {
  const empty: InboxPark = { savedAt: null, parked: false, hasPng: false, messagePreview: '' }
  const metaPath = join(inboxDir, 'meta.json')
  const msgPath = join(inboxDir, 'message.md')
  let savedAt: string | null = null
  let parked = false
  let hasPng = false
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
        savedAt?: string
        parked?: boolean
        hasPng?: boolean
      }
      savedAt = meta.savedAt ?? null
      parked = Boolean(meta.parked)
      hasPng = Boolean(meta.hasPng)
    } catch {
      // keep empty meta
    }
  }
  let messagePreview = ''
  if (existsSync(msgPath)) {
    const lines = readFileSync(msgPath, 'utf8').split('\n').slice(0, 8)
    messagePreview = lines.join('\n').slice(0, 480)
  }
  return { ...empty, savedAt, parked, hasPng, messagePreview }
}
