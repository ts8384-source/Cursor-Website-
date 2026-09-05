import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..', '..')
const pending = existsSync(join(root, 'inbox', 'PENDING'))
const messagePath = join(root, 'inbox', 'message.md')
const message = existsSync(messagePath) ? readFileSync(messagePath, 'utf8').trim() : ''

const additional_context = pending
  ? [
      'The iPad canvas has a parked turn. Read inbox/message.md and inbox/latest.png and treat them as the user message. Delete inbox/PENDING after you act.',
      message,
    ]
      .filter(Boolean)
      .join('\n\n')
  : 'No parked iPad turn yet. The pad host is npm run dev at port 5174. If the user is drawing, wait for inbox/PENDING.'

process.stdout.write(`${JSON.stringify({ additional_context })}\n`)
