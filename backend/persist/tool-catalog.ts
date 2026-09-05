export type ToolSpec = {
  id: string
  method: 'GET' | 'POST'
  path: string
  purpose: string
}

export const TOOLS: ToolSpec[] = [
  { id: 'health', method: 'GET', path: '/api/health', purpose: 'Process health and LAN pad URLs' },
  { id: 'tools', method: 'GET', path: '/api/tools', purpose: 'This catalog (Gorilla / SWE-agent ACI)' },
  { id: 'pages', method: 'GET', path: '/api/pages', purpose: 'Machine-readable Living Papers page list' },
  { id: 'page', method: 'GET', path: '/api/pages/:slug', purpose: 'One Markdown page plus frontmatter' },
  { id: 'overview', method: 'GET', path: '/api/overview', purpose: 'Short site map from MD + paper catalog' },
  { id: 'papers', method: 'GET', path: '/api/papers', purpose: 'OA papers on disk (papers ground catalog)' },
  { id: 'search', method: 'GET', path: '/api/search?q=', purpose: 'Hybrid retrieve, labeled per ground' },
  { id: 'ask', method: 'POST', path: '/api/ask', purpose: 'Ingest scribble, retrieve, write latest ask article' },
  { id: 'scripts', method: 'GET', path: '/api/scripts', purpose: 'Allowlisted rag.cli names' },
  { id: 'run-script', method: 'POST', path: '/api/scripts', purpose: 'Run seed | rebuild | ask | site' },
  {
    id: 'fetch',
    method: 'POST',
    path: '/api/fetch',
    purpose: 'OA paper: arXiv id or PDF/abs URL → data/papers + papers-ground ingest',
  },
  {
    id: 'papers-fetch',
    method: 'POST',
    path: '/api/papers/fetch',
    purpose: 'Same pipeline as POST /api/fetch (alias)',
  },
  { id: 'snapshot', method: 'POST', path: '/api/snapshot', purpose: 'Write iPad inbox snapshot' },
]

export function toolCatalog() {
  return {
    aci: 'content/CONTROL.md',
    rule: 'Call these tools. Do not scrape the site DOM.',
    tools: TOOLS,
  }
}
