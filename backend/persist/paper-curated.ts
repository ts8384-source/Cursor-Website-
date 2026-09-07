export type CuratedPaper = {
  id: string
  summary: string
  math: { term: string; def: string }[]
  diagrams: { label: string; note: string }[]
  executedIn: { path: string; how: string }[]
}

/** How each ingested paper’s idea is executed in this repo (or explicitly not). */
export const CURATED: CuratedPaper[] = [
  {
    id: 'living-papers-heer-2023',
    summary:
      'Markdown is the scholarly source; compile to a web article plus a machine-readable extraction API rather than a print-only PDF.',
    math: [{ term: 'MD source', def: 'One document compiled to HTML and list APIs.' }],
    diagrams: [{ label: 'Language toolkit diagram', note: 'Authoring pipeline from MD to web/PDF/API.' }],
    executedIn: [
      { path: 'backend/persist/pages.ts', how: 'Frontmatter + GET /api/pages list' },
      { path: 'frontend/src/site/markdown.ts', how: 'MD → HTML reader' },
      { path: 'data/md/', how: 'Living site articles on disk' },
    ],
  },
  {
    id: 'fidyll-conlen-2022',
    summary: 'Explorable explanations from a single narrative source (neighbor to Living Papers).',
    math: [],
    diagrams: [{ label: 'Explorable figure', note: 'Narrative + view compiled together.' }],
    executedIn: [{ path: 'frontend/src/site/SiteApp.tsx', how: 'One MD source, thin React host' }],
  },
  {
    id: 'scrollyvis-2023',
    summary: 'Scientific scrollytelling: guided steps tied to a visual, not whole-site scroll hijack.',
    math: [],
    diagrams: [{ label: 'Scrolly step track', note: 'One guided loop on Overview only.' }],
    executedIn: [{ path: 'frontend/src/site/SiteApp.tsx', how: 'scrolly rail on overview h3 steps' }],
  },
  {
    id: 'dashboard-design-patterns-2022',
    summary: 'Overview first, then filter and detail-on-demand for dense catalogs.',
    math: [],
    diagrams: [{ label: 'Overview / detail pattern', note: 'Catalog then passages.' }],
    executedIn: [
      { path: 'frontend/src/site/PaperCatalog.tsx', how: 'Filter then index search' },
      { path: 'data/md/overview.md', how: 'Whole-loop object first' },
    ],
  },
  {
    id: 'semantic-reader-project-2023',
    summary: 'AI reading interfaces: citation cards and in-place scholarly navigation.',
    math: [],
    diagrams: [{ label: 'Citation overlay', note: 'Cards in the reading rail.' }],
    executedIn: [{ path: 'frontend/src/site/SiteApp.tsx', how: 'Citation cards keyed by paper id' }],
  },
  {
    id: 'paper-plain-august-2023',
    summary: 'Gists, key questions, and term definitions beside the paper so dense text is approachable.',
    math: [{ term: 'gist', def: 'Plain-language section or page summary shown on demand.' }],
    diagrams: [{ label: 'Key-question rail', note: 'Questions point at answering passages.' }],
    executedIn: [
      { path: 'frontend/src/site/SiteApp.tsx', how: 'Gist, questions, glossary rail' },
      { path: 'frontend/src/site/markdown.ts', how: 'Section gist toggles' },
    ],
  },
  {
    id: 'inreactable-2025',
    summary: 'Insight graphs plus RAG for visual data stories. Neighbor, not a second graph index.',
    math: [],
    diagrams: [{ label: 'Insight graph', note: 'Cited; we keep a catalog graph only.' }],
    executedIn: [{ path: 'backend/persist/overview.ts', how: 'Cheap catalog map, not InReAcTable runtime' }],
  },
  {
    id: 'vadis-2025',
    summary: 'Query-conditioned document maps for iterative visual information seeking.',
    math: [],
    diagrams: [{ label: 'Document map', note: 'Search hits stay in the rail, grouped by ground.' }],
    executedIn: [{ path: 'frontend/src/site/SearchRail.tsx', how: 'Query then labeled hit groups' }],
  },
  {
    id: 'treereader-2025',
    summary: 'Hierarchical, Wikipedia-like paper reader with a persistent contents tree.',
    math: [],
    diagrams: [{ label: 'Tree TOC', note: 'Site pages + on-this-page headings.' }],
    executedIn: [{ path: 'frontend/src/site/SiteApp.tsx', how: 'Left TOC, 7:5 / TreeReader' }],
  },
  {
    id: 'colpali-2024',
    summary:
      'Page-as-image retrieval for PDFs and figures. Catalogued as future diagram-native retrieve; ingest the OA PDF before it leaves missingFromDisk.',
    math: [],
    diagrams: [{ label: 'Page embedding', note: 'Late interaction over page images, not text chunks.' }],
    executedIn: [{ path: 'data/diagrams/latest.json', how: 'Cited only — no ColPali embedder in this pass' }],
  },
  {
    id: 'vidorag-2025',
    summary: 'Multi-agent visual-document RAG. Cited as future diagram-native retrieve.',
    math: [],
    diagrams: [{ label: 'Page-as-image retrieve', note: 'Not a VLM index this pass.' }],
    executedIn: [{ path: 'data/diagrams/latest.json', how: 'Text diagram artifact; no ColPali embed' }],
  },
  {
    id: 'hm-rag-2025',
    summary: 'Hierarchical agents over heterogeneous stores. Motivates isolated grounds, not fusion.',
    math: [{ term: 'ground', def: 'Isolated retrieve index; no cross-ground RRF.' }],
    diagrams: [{ label: 'Store hierarchy', note: 'papers / code / scribble / cursor / md.' }],
    executedIn: [{ path: 'rag/', how: 'Five grounds, labeled merge' }],
  },
  {
    id: 'heta-rag-2025',
    summary: 'Heterogeneous RAG stores (vector, KG, full-text). Same isolation rule.',
    math: [],
    diagrams: [],
    executedIn: [{ path: 'backend/retrieve/hybrid.ts', how: 'Labeled merge only' }],
  },
  {
    id: 'ma-rag-2025',
    summary: 'Planner/extractor agent chain for RAG. Neighbor; agents here call /api/search.',
    math: [],
    diagrams: [],
    executedIn: [{ path: 'content/CONTROL.md', how: 'Retrieve hat uses tools, not an MA-RAG runtime' }],
  },
  {
    id: 'graphrag-2024',
    summary: 'Content graph versus flat chunks. We emit a catalog overview, not community summaries.',
    math: [],
    diagrams: [{ label: 'Entity graph', note: 'Not computed. GET /api/overview stands in.' }],
    executedIn: [{ path: 'backend/persist/overview.ts', how: 'Pages + papers catalog graph' }],
  },
  {
    id: 'webarena-2024',
    summary: 'Unstructured sites fail agents. Need gym-like, structured actions.',
    math: [],
    diagrams: [],
    executedIn: [{ path: 'backend/persist/tool-catalog.ts', how: 'GET /api/tools ACI' }],
  },
  {
    id: 'mind2web-2023',
    summary: 'HTML is too large; filter then act on a reduced control set.',
    math: [],
    diagrams: [],
    executedIn: [{ path: 'backend/http/routes.ts', how: 'JSON tools instead of DOM scrape' }],
  },
  {
    id: 'swe-agent-2024',
    summary: 'Agents need a designed computer interface, not a raw shell or unbounded page.',
    math: [{ term: 'ACI', def: 'Small structured action space for agents.' }],
    diagrams: [],
    executedIn: [{ path: 'content/CONTROL.md', how: 'Primary control surface' }],
  },
  {
    id: 'agent-workflow-memory-2024',
    summary:
      'Induce reusable workflows and retrieve them later. This repo uses CONTROL + decaying memory, not full AWM induction.',
    math: [{ term: 'workflow memory', def: 'Reusable routines stored apart from a single transcript.' }],
    diagrams: [{ label: 'Offline / online AWM', note: 'Cited. We store memories with forgetting instead.' }],
    executedIn: [
      { path: 'backend/persist/memory.ts', how: 'User/project lanes with half-life decay' },
      { path: 'content/CONTROL.md', how: 'Operator workflows on disk' },
    ],
  },
  {
    id: 'gorilla-2023',
    summary: 'List tools, then call them. Retrieval over an API catalog beats hallucinated calls.',
    math: [],
    diagrams: [],
    executedIn: [{ path: 'backend/persist/tool-catalog.ts', how: 'Gorilla-style catalog' }],
  },
  {
    id: 'holten-directed-edges-2009',
    summary:
      'Fat arrowheads on the target occlude nodes. Tapered edges and mid-path direction cues are faster and cleaner for directed graphs.',
    math: [],
    diagrams: [
      {
        label: 'Tapered vs arrowhead',
        note: 'Width falls off toward the target; small ticks sit on the path, not on the node.',
      },
    ],
    executedIn: [
      { path: 'frontend/src/site/DirectedEdge.tsx', how: 'Uniform skinny stroke + 72px-spaced chevrons; no taper ribbon' },
      { path: 'frontend/src/site/GraphCanvas.tsx', how: 'No 22×22 markerEnd; feedback still uses a step route; no flow toolbar' },
    ],
  },
  {
    id: 'arxiv-2604-12034',
    summary:
      'April 2026 compiled-wiki cluster (Karpathy, MemPalace, LLM Wiki v2) plus companion governance: TRIAGE, DECAY, CONTEXTUALIZE, CONSOLIDATE, AUDIT.',
    math: [],
    diagrams: [{ label: 'Companion operations', note: 'Five ops on a single-user wiki; not implemented here.' }],
    executedIn: [
      { path: 'data/md/wiki-memory.md', how: 'Temporary compare page; no compiler' },
      { path: 'data/memory', how: 'DECAY analogue on user/project lanes only' },
    ],
  },
  {
    id: 'arxiv-2604-21284',
    summary:
      'MemPalace palace hierarchy is metadata filtering on verbatim Chroma. Headline LongMemEval R@5 is mostly embeddings, not the loci metaphor.',
    math: [],
    diagrams: [{ label: 'Wings Rooms Drawers', note: 'Spatial labels over a vector store.' }],
    executedIn: [{ path: 'data/diagrams/wiki-memory-compare.json', how: 'Cited on the temporary compare graph only' }],
  },
]
