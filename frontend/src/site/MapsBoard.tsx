import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiUrl } from '../api'
import { OpenOnIpad } from './OpenOnIpad'
import type { MapEdge, MathTerm } from './types'

export function MapsBoard() {
  const { hash } = useLocation()
  const [edges, setEdges] = useState<MapEdge[]>([])
  const [terms, setTerms] = useState<MathTerm[]>([])
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<'math' | 'diagram'>('math')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')

  const load = () => {
    void fetch(apiUrl('/api/maps'))
      .then((r) => r.json())
      .then((data: { edges?: MapEdge[] }) => setEdges(data.edges ?? []))
    void fetch(apiUrl('/api/math'))
      .then((r) => r.json())
      .then((data: { terms?: MathTerm[] }) => setTerms(data.terms ?? []))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const raw = hash.replace('#math-', '').replace('#', '')
    if (!raw) return
    setQ(decodeURIComponent(raw).replace(/-/g, ' '))
  }, [hash])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return edges
    return edges.filter(
      (e) =>
        e.from.label.toLowerCase().includes(needle) ||
        e.to.label.toLowerCase().includes(needle) ||
        e.why.toLowerCase().includes(needle),
    )
  }, [edges, q])

  const onFetch = async (event: FormEvent) => {
    event.preventDefault()
    const query = q.trim()
    if (!query) {
      setErr('A math term or diagram label is required.')
      return
    }
    setStatus('fetching code…')
    setErr('')
    const res = await fetch(apiUrl('/api/maps/fetch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, kind }),
    })
    const data = (await res.json()) as { ok?: boolean; added?: unknown[]; error?: string }
    setStatus(res.ok && data.ok ? `fetched — ${data.added?.length ?? 0} new edges` : '')
    if (!res.ok || data.ok === false) setErr(data.error || 'fetch failed')
    load()
  }

  return (
    <section className="loop-board" aria-label="Math and diagram to code maps">
      <h2>On-demand code map</h2>
      <OpenOnIpad
        sourceType="math"
        sourceId={q.trim() ? `math:${q.trim()}` : 'math:maps'}
        sourceSlug="maps"
        title={q.trim() || 'Maps / mathematics'}
        pageId="page:maps"
        gist={q.trim() ? `Scribble on the math term “${q.trim()}”.` : 'Scribble on the math ↔ code map.'}
        capture=".loop-board"
      />
      <p className="rail-note">
        GET /api/maps and POST /api/maps/fetch. {edges.length} edges. Query is required (handbook 13:1).
      </p>
      <form className="fetch-form" onSubmit={(e) => void onFetch(e)}>
        <label htmlFor="map-q">Math term or diagram label (required)</label>
        <input
          id="map-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="RRF, gist, ACI, Hybrid RAG"
          autoCapitalize="none"
          required
        />
        <label htmlFor="map-kind">Kind</label>
        <select id="map-kind" value={kind} onChange={(e) => setKind(e.target.value as 'math' | 'diagram')}>
          <option value="math">Math / term</option>
          <option value="diagram">Diagram</option>
        </select>
        <button type="submit">Fetch code</button>
      </form>
      {status ? <p className="site-status">{status}</p> : null}
      {err ? (
        <p className="site-error" role="alert">
          {err}
        </p>
      ) : null}
      <h3>Lexicon</h3>
      <ul className="term-chips">
        {terms.map((t) => (
          <li key={`${t.paperId}-${t.term}`}>
            <button type="button" className="gist-toggle" onClick={() => setQ(t.term)} title={t.def}>
              {t.term}
            </button>
          </li>
        ))}
      </ul>
      <h3>Edges</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">From</th>
            <th scope="col">To (code)</th>
            <th scope="col">Why</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} id={e.from.kind === 'math' ? `math-${e.from.id.toLowerCase()}` : e.id}>
              <td>
                {e.paperId ? <Link to={`/docs/papers#${e.paperId}`}>{e.from.label}</Link> : e.from.label}
                <span className="hit-ground">{e.from.kind}</span>
              </td>
              <td>
                <code>{e.to.label}</code>
              </td>
              <td>{e.why}</td>
              <td>{e.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
