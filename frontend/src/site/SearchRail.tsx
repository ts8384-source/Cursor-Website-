import { useState, type FormEvent } from 'react'
import type { SearchHit } from './types'

const GROUNDS = ['papers', 'code', 'scribble', 'cursor', 'md'] as const

export function SearchRail({
  query,
  onQuery,
  hits,
  status,
  err,
  onSearch,
  onAsk,
}: {
  query: string
  onQuery: (q: string) => void
  hits: SearchHit[] | null
  status: string
  err: string
  onSearch: (event: FormEvent) => void
  onAsk: () => void
}) {
  const [openGround, setOpenGround] = useState<string | null>(null)

  return (
    <section className="search-rail" aria-label="Index search">
      <h2>Search the index</h2>
      <p className="rail-note">Overview first. Hits appear only after you search (dashboard detail-on-demand).</p>
      <form className="site-search" onSubmit={onSearch}>
        <label htmlFor="site-q">Query</label>
        <input
          id="site-q"
          name="q"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="isolated grounds, Living Papers"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <button type="submit">Search</button>
        <button type="button" onClick={onAsk}>
          Ask
        </button>
      </form>
      {status ? <p className="site-status">{status}</p> : null}
      {err ? <p className="site-error">{err}</p> : null}
      {hits ? (
        <div className="hit-groups">
          {GROUNDS.map((ground) => {
            const list = hits.filter((h) => h.ground === ground)
            if (!list.length) return null
            const open = openGround === ground
            return (
              <details
                key={ground}
                open={open}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) setOpenGround(ground)
                }}
              >
                <summary>
                  {ground} ({list.length})
                </summary>
                <ol>
                  {list.slice(0, open || list.length <= 2 ? 4 : 2).map((hit, i) => (
                    <li key={`${ground}-${i}`}>
                      <strong>{hit.title}</strong>
                      <p>{hit.text.slice(0, 180)}</p>
                    </li>
                  ))}
                </ol>
              </details>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
