import { useEffect, useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import type { MemoryView } from './types'

export function MemoryBoard() {
  const [items, setItems] = useState<MemoryView[]>([])
  const [forgottenCount, setForgottenCount] = useState(0)
  const [supersededCount, setSupersededCount] = useState(0)
  const [showForgotten, setShowForgotten] = useState(false)
  const [showSuperseded, setShowSuperseded] = useState(false)
  const [lane, setLane] = useState<'user' | 'project'>('project')
  const [text, setText] = useState('')
  const [supersedes, setSupersedes] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')

  const load = (forgotten = showForgotten, superseded = showSuperseded) => {
    const q = new URLSearchParams()
    if (forgotten) q.set('forgotten', '1')
    if (superseded) q.set('superseded', '1')
    const qs = q.toString() ? `?${q.toString()}` : ''
    void fetch(apiUrl(`/api/memory${qs}`))
      .then((r) => r.json())
      .then((data: { items?: MemoryView[]; forgottenCount?: number; supersededCount?: number }) => {
        setItems(data.items ?? [])
        setForgottenCount(data.forgottenCount ?? 0)
        setSupersededCount(data.supersededCount ?? 0)
      })
      .catch(() => setErr('memory unavailable'))
  }

  useEffect(() => {
    load()
  }, [])

  const onAdd = async (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim()) {
      setErr('Memory text is required.')
      return
    }
    setErr('')
    const res = await fetch(apiUrl('/api/memory'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lane,
        text: text.trim(),
        kind: 'note',
        ...(supersedes.trim() ? { supersedes: supersedes.trim() } : {}),
      }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || data.ok === false) {
      setErr(data.error || 'save failed')
      return
    }
    setText('')
    setSupersedes('')
    setStatus(
      supersedes.trim()
        ? `saved — supersedes ${supersedes.trim()} (old note stays on disk, hidden from retrieve)`
        : 'saved — this item will decay unless you touch it',
    )
    load()
  }

  const act = async (path: string, id: string) => {
    await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <section className="loop-board" aria-label="Long-term memory with forgetting">
      <h2>Active memories</h2>
      <p className="rail-note">
        GET /api/memory. {forgottenCount} forgotten (below threshold). {supersededCount} superseded
        (audit trail on disk). Papers and data/md never appear here.
      </p>
      <div className="paper-filter">
        <button
          type="button"
          aria-pressed={showForgotten}
          onClick={() => {
            const next = !showForgotten
            setShowForgotten(next)
            load(next, showSuperseded)
          }}
        >
          {showForgotten ? 'Hide forgotten' : 'Show forgotten'}
        </button>
        <button
          type="button"
          aria-pressed={showSuperseded}
          onClick={() => {
            const next = !showSuperseded
            setShowSuperseded(next)
            load(showForgotten, next)
          }}
        >
          {showSuperseded ? 'Hide superseded' : 'Show superseded'}
        </button>
      </div>
      {err ? (
        <p className="site-error" role="alert">
          {err}
        </p>
      ) : null}
      {status ? <p className="site-status">{status}</p> : null}
      <ol className="paper-list">
        {items.map((m) => (
          <li key={m.id} className={m.forgotten || m.superseded ? 'is-forgotten' : undefined}>
            <div className="paper-meta">
              {m.lane} · {m.kind} · {m.id} · strength {m.decayed.toFixed(2)} / half-life {m.halfLifeHours}h
              {m.forgotten ? ' · forgotten' : ''}
              {m.superseded ? ' · superseded' : ''}
            </div>
            <p>{m.text}</p>
            {m.supersedes ? (
              <p className="rail-note">
                Supersedes <code>{m.supersedes}</code>
              </p>
            ) : null}
            {m.supersededBy ? (
              <p className="rail-note">
                Replaced by <code>{m.supersededBy}</code>
              </p>
            ) : null}
            <div className="paper-links">
              <button type="button" className="gist-toggle" onClick={() => void act('/api/memory/touch', m.id)}>
                Touch (strengthen)
              </button>
              <button type="button" className="gist-toggle" onClick={() => void act('/api/memory/forget', m.id)}>
                Forget now
              </button>
            </div>
          </li>
        ))}
      </ol>
      <form className="fetch-form" onSubmit={(e) => void onAdd(e)}>
        <label htmlFor="mem-lane">Lane (required)</label>
        <select id="mem-lane" value={lane} onChange={(e) => setLane(e.target.value as 'user' | 'project')}>
          <option value="project">Project</option>
          <option value="user">User</option>
        </select>
        <label htmlFor="mem-text">New memory (required)</label>
        <input
          id="mem-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A decision or park to remember"
          required
        />
        <label htmlFor="mem-supersedes">Supersedes id (optional)</label>
        <input
          id="mem-supersedes"
          value={supersedes}
          onChange={(e) => setSupersedes(e.target.value)}
          placeholder="mem-… id this correction replaces"
        />
        <button type="submit">Remember</button>
      </form>
    </section>
  )
}
