import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from '../api'
import type { PageMeta, SandboxLane } from './types'
import { useFlaggedSlugs } from './SandboxFlagControl'

type SandboxPayload = {
  autoMerge?: boolean
  sitePolicy?: string
  policy?: string
  labs?: { id: string; name: string; status: string }[]
  lanes?: Record<SandboxLane, PageMeta[]>
}

const LANES: { id: SandboxLane; label: string; hint: string }[] = [
  { id: 'idea', label: 'Ideas', hint: 'Half-baked notions' },
  { id: 'code', label: 'Code', hint: 'Implement notes' },
  { id: 'research', label: 'Research', hint: 'Fetch logs and seeds' },
]

export function SandboxBoard({ hostId, hostSlug }: { hostId?: string; hostSlug?: string }) {
  const [data, setData] = useState<SandboxPayload | null>(null)
  const [lane, setLane] = useState<SandboxLane>('idea')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [phrase, setPhrase] = useState('')
  const [destSlug, setDestSlug] = useState('')
  const { rows: flaggedRows } = useFlaggedSlugs()

  const load = () => {
    void fetch(apiUrl('/api/sandbox'))
      .then((r) => r.json())
      .then((row: SandboxPayload) => setData(row))
      .catch(() => setErr('sandbox unavailable'))
  }

  useEffect(() => {
    load()
  }, [])

  const rows = data?.lanes?.[lane] ?? []
  const attached = useMemo(() => {
    if (!hostId) return []
    return rows.filter((p) => p.sandboxFor === hostId || (p.related ?? []).includes(hostId))
  }, [rows, hostId])
  const rest = useMemo(() => {
    const ids = new Set(attached.map((p) => p.id || p.slug))
    return rows.filter((p) => !ids.has(p.id || p.slug))
  }, [rows, attached])
  const onSandboxPage = Boolean(hostSlug?.startsWith('sandbox-'))

  const onPromote = async (event: FormEvent) => {
    event.preventDefault()
    if (!hostSlug) return
    setErr('')
    setMsg('')
    const res = await fetch(apiUrl('/api/sandbox/promote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: hostSlug, destSlug: destSlug.trim() || undefined, phrase: phrase.trim() }),
    })
    const body = (await res.json()) as { ok?: boolean; error?: string; href?: string; destSlug?: string }
    if (!res.ok || body.ok === false) {
      setErr(body.error || 'promote refused')
      return
    }
    setMsg(`copied to ${body.href || `/site/${body.destSlug}`} — source kept. Git lab not merged.`)
    setPhrase('')
    load()
  }

  return (
    <section className="sandbox-block" aria-labelledby="sandbox-heading">
      <header className="sandbox-head">
        <h2 id="sandbox-heading">
          <span className="wiki-badge wiki-badge-lab">Lab</span> Lab bench — working pages
        </h2>
        <p className="sandbox-lead">
          The bench is <Link to="/site/sandbox">Lab bench</Link> (olive Lab). Agents write children under{' '}
          <code>data/md/sandbox/</code>. Chat only points at <code>/site/&lt;slug&gt;</code>. How the nest
          works is <Link to="/docs/sandbox-how-the-lab-works">How the lab works</Link> — not an Ideas / Code /
          Research lane. Git forks use <code>POST /api/sandbox/fork</code>. Distinct from{' '}
          <Link to="/site/overview">Overview</Link> and the <Link to="/site/implement">To-implement</Link> queue.
          Handbook 7:2 / 7:6 / 9:1: grouped, labeled — not color-only.
        </p>
      </header>
      <div className="sandbox-tabs" role="tablist" aria-label="Sandbox lanes">
        {LANES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`sandbox-tab-${tab.id}`}
            aria-selected={lane === tab.id}
            aria-controls={`sandbox-panel-${tab.id}`}
            className={lane === tab.id ? 'is-active' : undefined}
            onClick={() => setLane(tab.id)}
          >
            {tab.label}
            <span className="sandbox-tab-hint">{tab.hint}</span>
          </button>
        ))}
      </div>
      <div
        className="sandbox-panel"
        role="tabpanel"
        id={`sandbox-panel-${lane}`}
        aria-labelledby={`sandbox-tab-${lane}`}
      >
        {err ? <p className="sandbox-err">{err}</p> : null}
        {msg ? <p className="sandbox-ok" role="status">{msg}</p> : null}
        {hostSlug === 'sandbox' ? (
          <div className="sandbox-flagged-list">
            <h3>Flagged explorations</h3>
            <p className="sandbox-lead">
              Interesting, come back — not the To-implement queue. Text chip, not color-only (handbook 9:1).
            </p>
            {flaggedRows.length ? (
              <ul className="sandbox-list">
                {flaggedRows.map((f) => (
                  <li key={f.slug}>
                    <Link to={f.href || `/site/${f.slug}`}>{f.title || f.slug}</Link>
                    <span className="wiki-badge wiki-badge-flagged">Flagged</span>
                    {f.note ? <span className="sandbox-gist">{f.note}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sandbox-empty">None flagged. Open a lab child and use Flag this exploration.</p>
            )}
          </div>
        ) : null}
        {attached.length ? (
          <>
            <h3>Tied to this page</h3>
            <ul className="sandbox-list">
              {attached.map((p) => (
                <li key={p.id || p.slug}>
                  <Link to={`/site/${p.slug}`}>{p.nav || p.title}</Link>
                  {p.gist ? <span className="sandbox-gist">{p.gist}</span> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <h3>{attached.length ? 'This lane' : 'Notes in this lane'}</h3>
        {rest.length ? (
          <ul className="sandbox-list">
            {rest.map((p) => (
              <li key={p.id || p.slug}>
                <Link to={`/site/${p.slug}`}>{p.nav || p.title}</Link>
                {p.gist ? <span className="sandbox-gist">{p.gist}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="sandbox-empty">Empty bench. Write <code>data/md/sandbox/</code> with <code>sandboxLane: {lane}</code>.</p>
        )}
        {onSandboxPage ? (
          <form className="sandbox-promote" onSubmit={(e) => void onPromote(e)}>
            <h3>Promote to main</h3>
            <p>Copies this file to <code>data/md/</code>. Does not merge a git lab. Type the lock phrase.</p>
            <label htmlFor="sandbox-dest">Destination slug (optional)</label>
            <input
              id="sandbox-dest"
              value={destSlug}
              onChange={(e) => setDestSlug(e.target.value)}
              placeholder="wiki-note"
              autoComplete="off"
            />
            <label htmlFor="sandbox-phrase">
              Phrase <span className="req">required</span>
            </label>
            <input
              id="sandbox-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="promote to main"
              autoComplete="off"
            />
            <button type="submit">Promote to main</button>
          </form>
        ) : (
          <p className="sandbox-foot">
            Operator: <Link to="/docs/sandbox-how-the-lab-works">How the lab works</Link>. Write a note, then open it —
            the promote form lives on the lab page. Trash bin: <Link to="/site/sandbox">Trash bin on Lab bench</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
