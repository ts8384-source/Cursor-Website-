import { readInboxPark } from '../persist/inbox-read.ts'
import { readBookkeep, type BookkeepEvent } from '../persist/bookkeep.ts'
import { SCRIPT_ALLOW } from '../scripts/runner.ts'
import { hybridSearch, loadSite } from './hybrid.ts'

const DEMO_QUERY = 'hybrid RAG local-site architecture'

function lastOfKind(events: BookkeepEvent[], kind: string) {
  return events.find((ev) => ev.kind === kind) ?? null
}

/** One payload for the architecture walkthrough. No second index. */
export async function loadDemo() {
  const events = readBookkeep(24)
  const lastAsk = lastOfKind(events, 'ask')
  const lastPark = lastOfKind(events, 'park')
  const query =
    (typeof lastAsk?.detail.query === 'string' && lastAsk.detail.query.trim()) || DEMO_QUERY

  const [search, site] = await Promise.all([hybridSearch(query, 4), loadSite()])
  const siteData = site.ok && site.data && typeof site.data === 'object' ? (site.data as Record<string, unknown>) : {}
  const article = typeof siteData.article === 'string' ? siteData.article : ''

  return {
    ok: true,
    query,
    merge: 'labeled-only',
    diagram: siteData.diagram ?? null,
    articlePath: 'data/md/architecture.md',
    articleLead: article.split('\n').slice(0, 16).join('\n'),
    per_ground: search.ok ? search.per_ground : {},
    searchOk: search.ok,
    searchHint: search.ok ? null : (search.hint || search.error || 'search unavailable'),
    inbox: readInboxPark(),
    lastPark,
    lastAsk,
    bookkeep: events,
    scripts: SCRIPT_ALLOW.map((name) => ({
      name,
      desc:
        name === 'seed'
          ? 'Ingest architecture + handbook + drop folders'
          : name === 'rebuild'
            ? 'Rebuild Chroma+BM25 indexes'
            : name === 'ask'
              ? 'Ingest scribble and write md + diagram'
              : 'Print latest site payload',
    })),
  }
}
