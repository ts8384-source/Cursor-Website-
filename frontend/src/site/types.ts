export type GlossaryEntry = { term: string; def: string }

export type SandboxLane = 'idea' | 'code' | 'research'

export type PageMeta = {
  id?: string
  slug: string
  title: string
  nav: string
  order: number
  gist: string
  questions: string[]
  glossary: GlossaryEntry[]
  citations: string[]
  tags?: string[]
  related?: string[]
  depth?: 'short' | 'standard' | 'long'
  pageBudget?: number
  sandbox?: boolean
  sandboxLane?: SandboxLane | ''
  sandboxFor?: string
  path: string
  scrolly: boolean
  hidden?: boolean
  parent?: string
  children?: string[]
  /** Child keeps its own route instead of folding into the parent topic page. */
  subpage?: boolean
  /** Live widgets this page mounts, by registry name. See `embeds.tsx`. */
  embeds?: string[]
  highlight?: 'start' | 'queue' | 'lab' | ''
  project?: string
  bin?: 'boot' | 'doc'
  href?: string
}

export type PageTreeNode = {
  id: string
  slug: string
  nav: string
  title: string
  gist: string
  highlight?: 'start' | 'queue' | 'lab' | ''
  href?: string
  bin?: 'boot' | 'doc'
  children: PageTreeNode[]
}

export type MetaType = 'page' | 'paper' | 'node' | 'module' | 'diagram' | 'board' | 'code'

export type BoardSourceType = 'page' | 'paper' | 'diagram' | 'math' | 'node'
export type BoardSurface = 'clean' | 'stamped'

export type BoardAsset = {
  file: string
  mime: string
  w: number
  h: number
  kind: 'image' | 'pdf'
}

export type TiedBoard = {
  id: string
  type: 'board'
  title: string
  sourceType: BoardSourceType
  sourceId: string
  sourceSlug?: string
  pageId?: string
  paperIds: string[]
  related: string[]
  citations: string[]
  boardKey: string
  persistenceKey: string
  href: string
  padHref: string
  gist: string
  backdrop: { kind: BoardSourceType; text: string; href?: string }
  surface: BoardSurface
  assetPath?: string
  assets: BoardAsset[]
  pdfFile?: string
  tags: string[]
  createdAt: string
  updated: string
  summary: { short: string; long: string }
}

export type ParkBoardMeta = {
  boardId?: string
  pageId?: string
  paperIds?: string[]
  sourceType?: BoardSourceType | string
  sourceId?: string
  sourceSlug?: string
  boardKey?: string
  surface?: BoardSurface | string
  assetPath?: string
}

export type MetaRecord = {
  id: string
  type: MetaType
  title: string
  slug?: string
  href?: string
  summary: { short: string; long: string }
  tags: string[]
  citations: string[]
  related: string[]
  glossary: GlossaryEntry[]
  updated: string
  pageId?: string
  paperIds?: string[]
  boardKey?: string
  sourceSlug?: string
  sourceType?: string
  surface?: string
  assetPath?: string
  kind?: string
  implements?: string[]
  derived_from?: string[]
  path?: string
}

export type PageDoc = PageMeta & { markdown: string; body: string }

export type PaperRecord = {
  id: string
  title: string
  list: string
  /** 'framework' = read to build the tool; 'project' = fetched while using it. */
  collection: 'framework' | 'project'
  authors: string
  year: string
  venue: string
  oa_url: string
  arxiv: string
  file: string
}

export type SearchHit = {
  title: string
  text: string
  score: number
  ground: string
  doc_id?: string
}

export type MathTerm = { term: string; def: string; paperId: string }

export type PaperFigure = { paperId: string; label: string; note: string }

export type ExecutionLink = { paperId: string; path: string; how: string }

export type PaperDbRecord = PaperRecord & {
  summary: string
  math: MathTerm[]
  figures: PaperFigure[]
  executedIn: ExecutionLink[]
  permanent: true
}

export type MapNode = { kind: string; id: string; label: string }

export type MapEdge = {
  id: string
  from: MapNode
  to: MapNode
  why: string
  paperId?: string
  source: string
}

export type MemoryView = {
  id: string
  lane: 'user' | 'project'
  text: string
  kind: string
  createdAt: string
  lastAccessAt: string
  strength: number
  halfLifeHours: number
  decayed: number
  forgotten: boolean
  superseded?: boolean
  supersedes?: string
  supersededBy?: string
}

export type NodeMeta = {
  summaryShort?: string
  summaryLong?: string
  pageId?: string
  paperIds?: string[]
  related?: string[]
}

export type DiagramNode = {
  id: string
  label: string
  group?: string
  detail?: string
  x?: number
  y?: number
  meta?: NodeMeta
}
export type DiagramEdge = {
  from: string
  to: string
  label?: string
  kind?: string
  direction?: string
  reversed?: boolean
  animated?: boolean
  learnable?: boolean
}
export type DiagramRegion = {
  id: string
  label: string
  nodeIds: string[]
  source?: 'user' | 'inferred'
}
export type DiagramGraph = {
  id: string
  title: string
  updatedAt?: string
  source?: string
  /** Caption shown under the board. Absent = the generic hybrid-loop wording. */
  note?: string
  animatedEdges?: boolean
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  regions?: DiagramRegion[]
  blankets?: DiagramRegion[]
}
