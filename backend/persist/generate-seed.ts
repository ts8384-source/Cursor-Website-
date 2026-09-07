import { loadPaperDb, loadPaperRecord } from './paper-db.ts'

/** In-DB paper only. No open-web crawl. No invented ids. */
export function generateSeed(paperId?: string) {
  const db = loadPaperDb()
  if (!db.papers.length) {
    return { ok: false as const, error: 'paper DB empty — not in DB', fetch: 'POST /api/papers/fetch' }
  }
  const wanted = paperId?.trim()
  if (wanted) {
    const paper = loadPaperRecord(wanted)
    if (!paper) {
      return {
        ok: false as const,
        error: `Not in DB: ${wanted}. POST /api/papers/fetch — do not invent.`,
        paperId: wanted,
        fetch: 'POST /api/papers/fetch',
      }
    }
    return seedFrom(paper)
  }
  const paper = db.papers[Math.floor(Math.random() * db.papers.length)]
  return seedFrom(paper)
}

function seedFrom(paper: NonNullable<ReturnType<typeof loadPaperRecord>>) {
  return {
    ok: true as const,
    paperId: paper.id,
    title: paper.title,
    gist: paper.summary.slice(0, 400),
    href: `/site/papers#${paper.id}`,
    year: paper.year,
    venue: paper.venue,
    rule: 'Remote combination uses this in-DB paperId only. Do not invent papers. Hand off to fetch for grounding.',
    generate: 'draft MD citing this id; judge is cite-or-fetch / tests / human — not same-model self-review',
  }
}
