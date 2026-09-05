import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { diagramsDir, mdDir } from '../paths.ts'

/** Disk fallback when `rag.cli site` is down. Does not retrieve. */
export function siteFallback() {
  const mdPath = join(mdDir, 'architecture.md')
  const diagramPath = join(diagramsDir, 'latest.json')
  let diagram: unknown = { title: 'Hybrid RAG local-site loop', nodes: [], edges: [] }
  if (existsSync(diagramPath)) {
    try {
      diagram = JSON.parse(readFileSync(diagramPath, 'utf8'))
    } catch {
      // keep empty diagram
    }
  }
  return {
    article: existsSync(mdPath)
      ? readFileSync(mdPath, 'utf8')
      : '# Hybrid RAG local-site loop\n\nSeed the index to fill this page.\n',
    diagram,
    articlePath: 'data/md/architecture.md',
    fallback: true,
  }
}
