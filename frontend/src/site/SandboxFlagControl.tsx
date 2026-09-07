import { useEffect, useState, type FormEvent } from 'react'
import { apiUrl } from '../api'

type FlagRow = { slug: string; title?: string; href?: string; note?: string; flagged?: boolean }

type Props = {
  slug: string
  sandbox?: boolean
}

function isSandboxNest(slug: string, sandbox?: boolean) {
  return slug === 'sandbox' || Boolean(sandbox) || slug.startsWith('sandbox-')
}

export function SandboxFlagControl({ slug, sandbox }: Props) {
  const [flagged, setFlagged] = useState(false)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')

  const load = () => {
    void fetch(apiUrl('/api/sandbox/flags'))
      .then((r) => r.json())
      .then((data: { flags?: FlagRow[] }) => {
        const row = (data.flags ?? []).find((f) => f.slug === slug)
        setFlagged(Boolean(row))
        if (row?.note) setNote(row.note)
      })
      .catch(() => setErr('flags unavailable'))
  }

  useEffect(() => {
    if (!isSandboxNest(slug, sandbox)) return
    load()
  }, [slug, sandbox])

  if (!isSandboxNest(slug, sandbox)) return null

  const onToggle = async (event: FormEvent) => {
    event.preventDefault()
    setErr('')
    setStatus('')
    const next = !flagged
    const res = await fetch(apiUrl('/api/sandbox/flag'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, flagged: next, note: note.trim() || undefined }),
    })
    const body = (await res.json()) as { ok?: boolean; flagged?: boolean; error?: string }
    if (!res.ok || body.ok === false) {
      setErr(body.error || 'flag failed')
      return
    }
    setFlagged(Boolean(body.flagged))
    setStatus(body.flagged ? 'Flagged — interesting, come back. Not the To-implement queue.' : 'Unflagged.')
    window.dispatchEvent(new Event('sandbox-flags-changed'))
  }

  return (
    <form className="sandbox-flag" onSubmit={(e) => void onToggle(e)} aria-labelledby="sandbox-flag-heading">
      <h2 id="sandbox-flag-heading">Flag this exploration</h2>
      <p>
        Mark as <strong>interesting, come back</strong> — not discuss / will-implement. Agents read{' '}
        <code>GET /api/sandbox/flags</code> at the start of a turn or when you say “flagged.” Handbook{' '}
        <strong>13:2</strong> (button names the action) and <strong>9:1</strong> (label, not color-only). Hit target{' '}
        ~44px.
      </p>
      <label htmlFor="sandbox-flag-note">
        Note <span className="opt">optional</span>
      </label>
      <input
        id="sandbox-flag-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="why this is interesting"
        autoComplete="off"
      />
      <button type="submit" className={flagged ? 'is-flagged' : undefined}>
        {flagged ? 'Unflag this exploration' : 'Flag this exploration'}
      </button>
      {status ? (
        <p className="sandbox-ok" role="status">
          {status}
        </p>
      ) : null}
      {err ? <p className="sandbox-err">{err}</p> : null}
    </form>
  )
}

export function useFlaggedSlugs() {
  const [slugs, setSlugs] = useState<string[]>([])
  const [rows, setRows] = useState<FlagRow[]>([])

  const load = () => {
    void fetch(apiUrl('/api/sandbox/flags'))
      .then((r) => r.json())
      .then((data: { flags?: FlagRow[]; slugs?: string[] }) => {
        setRows(data.flags ?? [])
        setSlugs(data.slugs ?? (data.flags ?? []).map((f) => f.slug))
      })
      .catch(() => undefined)
  }

  useEffect(() => {
    load()
    const onChange = () => load()
    window.addEventListener('sandbox-flags-changed', onChange)
    return () => window.removeEventListener('sandbox-flags-changed', onChange)
  }, [])

  return { slugs, rows, reload: load }
}
