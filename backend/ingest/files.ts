import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { root } from '../paths.ts'

export type FileNode = {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: FileNode[]
}

const SKIP_NAMES = new Set(['node_modules', '.git', 'dist'])

function keepListingName(name: string) {
  if (SKIP_NAMES.has(name)) return false
  if (name === '.' || name === '..') return false
  if (name.startsWith('.') && name !== '.cursor' && name !== '.gitignore' && name !== '.cursorignore') {
    return false
  }
  return true
}

function walkFiles(absDir: string, rel: string): FileNode[] {
  let entries
  try {
    entries = readdirSync(absDir, { withFileTypes: true })
  } catch {
    return []
  }
  const nodes: FileNode[] = []
  for (const entry of entries) {
    if (!keepListingName(entry.name)) continue
    const path = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path,
        type: 'dir',
        children: walkFiles(join(absDir, entry.name), path),
      })
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      nodes.push({ name: entry.name, path, type: 'file' })
    }
  }
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function repoTree() {
  return { root: 'Drawinng-Local-Website-Loop', tree: walkFiles(root, '') }
}
