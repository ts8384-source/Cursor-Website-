import { listPages } from './pages.ts'
import { listPapers } from './papers-catalog.ts'

/** Cheap GraphRAG stand-in: catalog graph, not a community-summary rebuild. */
export function siteOverview() {
  const pages = listPages()
  const papers = listPapers()
  const frontend = papers.filter((p) => p.list === 'frontend')
  const backend = papers.filter((p) => p.list === 'backend')
  return {
    title: 'Drawing-local website loop',
    gist: 'iPad ink → hybrid RAG → Markdown pages → tool ACI. Isolated grounds, no cross-ground RRF.',
    pages: pages.map((p) => ({ slug: p.slug, title: p.title, gist: p.gist })),
    papers: {
      count: papers.length,
      frontend: frontend.map((p) => p.id),
      backend: backend.map((p) => p.id),
    },
    loop: ['draw /', 'park inbox/', 'rag hybrid search', 'md pages', 'GET /api/tools'],
    control: 'content/CONTROL.md',
    note: 'Not a GraphRAG entity index. Generated from MD frontmatter + paper headers.',
  }
}
