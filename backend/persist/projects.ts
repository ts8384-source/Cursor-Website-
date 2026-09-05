import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir, diagramsDir } from '../paths.ts'

const projectsDir = join(dataDir, 'projects')
const indexPath = join(projectsDir, 'index.json')
const idOk = /^[a-z0-9][a-z0-9-]{0,64}$/

export type ProjectMeta = {
  id: string
  title: string
  summary: string
  diagram: string
}

type IndexFile = { projects?: ProjectMeta[] }

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function listProjects(): ProjectMeta[] {
  if (!existsSync(indexPath)) return []
  try {
    const data = readJson(indexPath) as IndexFile
    return Array.isArray(data.projects) ? data.projects : []
  } catch {
    return []
  }
}

export function loadProject(id: string) {
  if (!idOk.test(id)) return null
  const meta = listProjects().find((p) => p.id === id)
  if (!meta || !idOk.test(meta.diagram)) return null
  const diagramPath = join(diagramsDir, `${meta.diagram}.json`)
  if (!existsSync(diagramPath)) return null
  try {
    const diagram = readJson(diagramPath)
    return { project: meta, diagram }
  } catch {
    return null
  }
}
