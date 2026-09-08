import { useMemo, useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import { FetchPaperForm } from './FetchPaperForm'
import { OpenOnIpad } from './OpenOnIpad'
import type { PaperRecord, SearchHit } from './types'

/**
 * Two shelves from the `collection` metadata, each split by the older `list` field. Nothing here
 * is a hand-kept list of ids: a paper lands in a shelf because of what its own header says.
 */
const SHELVES = [
  {
    key: 'framework',
    label: 'Framework papers',
    note: 'Read to build the framework itself — the interface and agent-connect ground.',
  },
  {
    key: 'project',
    label: 'Project papers',
    note: 'Fetched while working on a project built on the framework.',
  },
] as const

const LIST_LABELS: Record<string, string> = {
  frontend: 'Frontend / visual IA',
  backend: 'Backend / agent-connect',
  fetched: 'Fetched on demand',
}

const listLabel = (list: string) => LIST_LABELS[list] || (list ? `List: ${list}` : 'Unfiled')

/** Lists in a shelf, known ones first, then whatever else turned up. */
function listsIn(rows: PaperRecord[]): string[] {
  const seen = [...new Set(rows.map((p) => p.list))]
  const known = Object.keys(LIST_LABELS).filter((k) => seen.includes(k))
  return [...known, ...seen.filter((s) => !LIST_LABELS[s]).sort()]
}

export function PaperCatalog({
  papers,
  onRefresh,
}: {
  papers: PaperRecord[]
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('')
  const [group, setGroup] = useState('all')
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const [kind, key] = group.split(':')
    return papers.filter((p) => {
      if (kind === 'shelf' && p.collection !== key) return false
      if (kind === 'list' && p.list !== key) return false
      if (!q) return true
      return [p.title, p.authors, p.venue, p.year, p.id].join(' ').toLowerCase().includes(q)
    })
  }, [papers, filter, group])

  const onSearchIndex = async (event: FormEvent) => {
    event.preventDefault()
    const q = filter.trim()
    if (!q) return
    setStatus('searching index…')
    setErr('')
    const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}`))
    const data = (await res.json()) as { ok?: boolean; hits?: SearchHit[]; error?: string; hint?: string }
    setHits((data.hits ?? []).filter((h) => h.ground === 'papers'))
    setStatus('')
    if (!res.ok || data.ok === false) setErr(data.hint || data.error || 'search failed')
  }

  return (
    <section className="paper-catalog" aria-label="Ingested papers">
      <h2>Corpus overview</h2>
      <p className="rail-note">
        {papers.length} papers on disk (GET /api/papers). Filter the catalog, then search the papers ground for passages.
      </p>
      <form className="paper-filter" onSubmit={(e) => void onSearchIndex(e)}>
        <label htmlFor="paper-q">Filter catalog or search the index</label>
        <input
          id="paper-q"
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Living Papers, TreeReader, hybrid RAG"
          autoCapitalize="none"
        />
        <label htmlFor="paper-group">Show</label>
        <select id="paper-group" value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">All papers</option>
          <optgroup label="Shelf">
            {SHELVES.map((s) => (
              <option key={s.key} value={`shelf:${s.key}`}>
                {s.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="List">
            {Object.entries(LIST_LABELS).map(([key, label]) => (
              <option key={key} value={`list:${key}`}>
                {label}
              </option>
            ))}
          </optgroup>
        </select>
        <button type="submit">Search index</button>
      </form>
      {status ? <p className="site-status">{status}</p> : null}
      {err ? <p className="site-error" role="alert">{err}</p> : null}
      {hits ? (
        <div className="hit-groups">
          <h3>Index passages ({hits.length})</h3>
          <ol>
            {hits.slice(0, 8).map((hit, i) => (
              <li key={`${hit.doc_id}-${i}`}>
                <strong>{hit.title}</strong>
                <p>{hit.text.slice(0, 220)}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      <FetchPaperForm onDone={onRefresh} />
      {SHELVES.map((shelf) => {
        const shelfRows = visible.filter((p) => p.collection === shelf.key)
        if (!shelfRows.length) return null
        return (
          <div className="paper-shelf" key={shelf.key}>
            <h3 id={`shelf-${shelf.key}`}>
              {shelf.label} <span className="paper-shelf-count">{shelfRows.length}</span>
            </h3>
            <p className="rail-note">{shelf.note}</p>
            {listsIn(shelfRows).map((list) => (
              <div key={list}>
                <h4>{listLabel(list)}</h4>
                <ol className="paper-list">
                  {shelfRows
                    .filter((p) => p.list === list)
                    .map((paper) => (
                      <li key={paper.id} id={paper.id}>
                        <strong>{paper.title}</strong>
                        <div className="paper-meta">
                          {paper.authors}. {paper.year}. {paper.venue}.
                        </div>
                        <div className="paper-links">
                          <code>{paper.id}</code>
                          {paper.oa_url ? (
                            <a href={paper.oa_url} rel="noreferrer">
                              OA
                            </a>
                          ) : null}
                          <OpenOnIpad
                            sourceType="paper"
                            sourceId={paper.id}
                            title={paper.title}
                            paperIds={[paper.id]}
                            citations={[paper.id]}
                            gist={`${paper.authors}. ${paper.year}. ${paper.venue}.`}
                          />
                        </div>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        )
      })}
      {visible.length ? null : <p className="rail-note">No paper matches that filter.</p>}
    </section>
  )
}
