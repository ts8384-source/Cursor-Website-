import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from '../api'
import type { PaperDbRecord } from './types'

export function SummariesBoard() {
  const [papers, setPapers] = useState<PaperDbRecord[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    void fetch(apiUrl('/api/papers/db'))
      .then((r) => r.json())
      .then((data: { papers?: PaperDbRecord[]; missingFromDisk?: string[] }) => {
        setPapers(data.papers ?? [])
        setMissing(data.missingFromDisk ?? [])
      })
      .catch(() => setErr('paper DB unavailable'))
  }, [])

  return (
    <section className="loop-board" aria-label="Permanent paper summaries">
      <h2>Permanent paper DB</h2>
      <p className="rail-note">
        {papers.length} records from GET /api/papers/db. These do not decay. Machine copy: data/papers/db.json.
      </p>
      {err ? (
        <p className="site-error" role="alert">
          {err}
        </p>
      ) : null}
      {missing.length ? (
        <p className="rail-note">Named in the curated table but not on disk: {missing.join(', ')}.</p>
      ) : null}
      <ol className="paper-list">
        {papers.map((p) => (
          <li key={p.id} id={`sum-${p.id}`}>
            <Link to={`/docs/papers#${p.id}`}>
              <strong>{p.title || p.id}</strong>
            </Link>
            <div className="paper-meta">
              {p.authors}. {p.year}. {p.venue}.
            </div>
            <p>{p.summary}</p>
            {p.math.length ? (
              <p className="paper-meta">
                Math:{' '}
                {p.math.map((m) => (
                  <Link key={m.term} className="math-term" to={`/site/maps#math-${m.term.toLowerCase()}`}>
                    {m.term}
                  </Link>
                ))}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
