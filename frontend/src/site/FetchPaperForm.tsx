import { useState, type FormEvent } from 'react'
import { apiUrl } from '../api'

export function FetchPaperForm({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const raw = value.trim()
    if (!raw) return
    setBusy(true)
    setErr('')
    setStatus('fetching and indexing…')
    const body = /^\d{4}\.\d{4,5}/.test(raw) || raw.toLowerCase().startsWith('arxiv:')
      ? { arxiv: raw }
      : { url: raw }
    try {
      const res = await fetch(apiUrl('/api/papers/fetch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as {
        ok?: boolean
        skipped?: boolean
        id?: string
        title?: string
        error?: string
        hint?: string
      }
      if (!res.ok || !data.ok) {
        setStatus('')
        setErr(data.hint ? `${data.error} (${data.hint})` : data.error || `fetch failed (${res.status})`)
        return
      }
      setStatus(
        data.skipped
          ? `Already ingested: ${data.title || data.id}`
          : `Indexed ${data.title || data.id}`,
      )
      onDone()
    } catch (error) {
      setStatus('')
      setErr(error instanceof Error ? error.message : 'fetch failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="fetch-panel" aria-label="Fetch an open-access paper">
      <h3>Fetch paper</h3>
      <p className="rail-note">arXiv id (for example 2407.01449) or an OA PDF / abs URL. Localhost and private nets are blocked.</p>
      <form className="fetch-form" onSubmit={(e) => void onSubmit(e)}>
        <label htmlFor="fetch-src">arXiv id or OA URL</label>
        <input
          id="fetch-src"
          name="source"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="2407.01449 or https://arxiv.org/pdf/…"
          autoCapitalize="none"
          autoCorrect="off"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          Fetch
        </button>
      </form>
      {status ? <p className="site-status">{status}</p> : null}
      {err ? <p className="site-error" role="alert">{err}</p> : null}
    </section>
  )
}
