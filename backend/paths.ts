import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repo root (parent of `backend/`). */
export const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const inboxDir = join(root, 'inbox')
export const dataDir = join(root, 'data')
export const mdDir = join(dataDir, 'md')
/** Framework doc wiki. Optional: if this folder is missing, the boot wiki still runs. */
export const docsDir = join(dataDir, 'docs')
export const bookkeepDir = join(dataDir, 'bookkeep')
export const diagramsDir = join(dataDir, 'diagrams')
export const papersDir = join(dataDir, 'papers')
export const codeDir = join(dataDir, 'code')
export const cursorDir = join(dataDir, 'cursor')
export const memoryDir = join(dataDir, 'memory')
export const implementDir = join(dataDir, 'implement')
export const sandboxDir = join(dataDir, 'sandbox')
export const mapsDir = join(dataDir, 'maps')
export const boardsDir = join(dataDir, 'boards')
export const pastWorksDir = join(dataDir, 'past-works')

export const backendPort = Number(process.env.BACKEND_PORT ?? 5175)
export const padPort = Number(process.env.PAD_PORT ?? 5174)

export function ensureDataDirs() {
  for (const dir of [inboxDir, mdDir, bookkeepDir, diagramsDir, papersDir, codeDir, cursorDir, memoryDir, implementDir, sandboxDir, mapsDir, boardsDir, pastWorksDir]) {
    mkdirSync(dir, { recursive: true })
  }
}
