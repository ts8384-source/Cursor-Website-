export type GlossaryEntry = { term: string; def: string }

export type PageMeta = {
  slug: string
  title: string
  nav: string
  order: number
  gist: string
  questions: string[]
  glossary: GlossaryEntry[]
  citations: string[]
  path: string
  scrolly: boolean
}

export type PageDoc = PageMeta & { markdown: string; body: string }

export type PaperRecord = {
  id: string
  title: string
  list: string
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
