import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { bookkeepDir, ensureDataDirs } from '../paths.ts'

export type BookkeepEvent = {
  at: string
  kind: string
  detail: Record<string, unknown>
}

export function bookkeep(kind: string, detail: Record<string, unknown> = {}) {
  ensureDataDirs()
  const event: BookkeepEvent = { at: new Date().toISOString(), kind, detail }
  appendFileSync(join(bookkeepDir, 'log.jsonl'), `${JSON.stringify(event)}\n`, 'utf8')
  return event
}

export function readBookkeep(limit = 40): BookkeepEvent[] {
  const file = join(bookkeepDir, 'log.jsonl')
  if (!existsSync(file)) return []
  const lines = readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
  const events: BookkeepEvent[] = []
  for (const line of lines.slice(-limit)) {
    try {
      events.push(JSON.parse(line) as BookkeepEvent)
    } catch {
      // skip a broken line
    }
  }
  return events.reverse()
}
