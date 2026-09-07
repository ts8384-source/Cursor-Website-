import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from '../api'

type Row = {
  paperId: string
  summary: string
  executedIn: { path: string; how: string }[]
  math: { term: string; def: string }[]
  diagrams: { label: string; note: string }[]
}

export function ExecutionBoard() {
  const [rows, setRows] = useState<Row[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    void fetch(apiUrl('/api/execution'))
      .then((r) => r.json())
      .then((data: { papers?: Row[] }) => setRows(data.papers ?? []))
      .catch(() => setErr('execution table unavailable'))
  }, [])

  return (
    <section className="loop-board" aria-label="How paper ideas are executed">
      <h2>Execution table</h2>
      <p className="rail-note">GET /api/execution. Include code: each idea names the files that implement it, or says it does not.</p>
      {err ? (
        <p className="site-error" role="alert">
          {err}
        </p>
      ) : null}
      <table>
        <thead>
          <tr>
            <th scope="col">Paper</th>
            <th scope="col">Idea</th>
            <th scope="col">Repo files</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.paperId} id={`ex-${row.paperId}`}>
              <td>
                <Link to={`/docs/papers#${row.paperId}`}>{row.paperId}</Link>
              </td>
              <td>
                <p>{row.summary}</p>
                {row.math.length ? <p className="paper-meta">Math: {row.math.map((m) => m.term).join(', ')}</p> : null}
                {row.diagrams.length ? (
                  <p className="paper-meta">Diagrams: {row.diagrams.map((d) => d.label).join(', ')}</p>
                ) : null}
              </td>
              <td>
                <ul>
                  {row.executedIn.map((ex) => (
                    <li key={ex.path}>
                      <code>{ex.path}</code> — {ex.how}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
