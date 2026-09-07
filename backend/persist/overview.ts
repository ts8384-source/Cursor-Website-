import { docsPresent } from './docs.ts'
import { listPages, pageTree, pagesForBin, type PageBin } from './pages.ts'
import { listPapers } from './papers-catalog.ts'

/** Catalog + live wiki IA tree. Default is the boot wiki only. */
export function siteOverview(bin: PageBin = 'boot') {
  const pages = pagesForBin(listPages(), bin)
  const papers = listPapers()
  const frontend = papers.filter((p) => p.list === 'frontend')
  const backend = papers.filter((p) => p.list === 'backend')
  return {
    title: 'Drawing-local website loop',
    gist: 'iPad ink → hybrid RAG → Markdown pages → tool ACI. Isolated grounds, no cross-ground RRF.',
    pages: pages.filter((p) => !p.hidden && !p.sandbox).map((p) => ({
      slug: p.slug,
      title: p.title,
      gist: p.gist,
      parent: p.parent,
      children: p.children,
    })),
    tree: pageTree(pages),
    graph: 'GET /api/graph — one wiki knowledge graph over meta links. Not community detection.',
    papers: {
      count: papers.length,
      frontend: frontend.map((p) => p.id),
      backend: backend.map((p) => p.id),
    },
    loop: [
      'draw /',
      'park inbox/',
      'rag hybrid search',
      'md pages',
      'paper DB + maps + memory',
      'GET /api/tools',
    ],
    control: bin === 'doc' ? 'content/CONTROL.md' : 'data/md/overview.md',
    bin,
    docs: docsPresent(),
    note:
      bin === 'boot'
        ? 'Boot wiki IA from data/md. Framework explain pages live in data/docs and do not appear here.'
        : 'Framework doc wiki IA from data/docs. Deleting that folder removes this tree. Boot wiki is untouched.',
  }
}
