import { useMemo, useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import { FetchPaperForm } from './FetchPaperForm'
import type { PaperRecord, SearchHit } from './types'

const GROUPS = [
  { key: 'frontend', label: 'Frontend / visual IA' },
  { key: 'backend', label: 'Backend / agent-connect' },
  { key: 'fetched', label: 'Fetched on demand' },
]

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
    return papers.filter((p) => {
      if (group !== 'all' && p.list !== group) return false
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
        <label htmlFor="paper-group">List</label>
        <select id="paper-group" value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">All lists</option>
          {GROUPS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
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
      {GROUPS.map((g) => {
        const rows = visible.filter((p) => p.list === g.key)
        if (!rows.length) return null
        return (
          <div key={g.key}>
            <h3>{g.label}</h3>
            <ol className="paper-list">
              {rows.map((paper) => (
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
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )
      })}
      {visible.some((p) => !GROUPS.some((g) => g.key === p.list)) ? (
        <div>
          <h3>Other</h3>
          <ol className="paper-list">
            {visible
              .filter((p) => !GROUPS.some((g) => g.key === p.list))
              .map((paper) => (
                <li key={paper.id} id={paper.id}>
                  <strong>{paper.title}</strong>
                  <div className="paper-meta">
                    {paper.year} {paper.venue}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}
