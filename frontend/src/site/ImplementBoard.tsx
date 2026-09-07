import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiUrl } from '../api'

export type ImplementStatus = 'discuss' | 'will-implement' | 'implemented'

export type ImplementView = {
  id: string
  title: string
  note: string
  status: ImplementStatus
  related: string[]
  createdAt: string
  updatedAt: string
  implementedAt?: string
  supersedes?: string
  supersededBy?: string
  archived: boolean
}

function hrefFor(id: string) {
  if (id.startsWith('page:')) return `/site/${id.slice('page:'.length)}`
  if (id.startsWith('diagram:')) return '/docs/diagrams'
  if (id.startsWith('arxiv-') || !id.includes(':')) return `/docs/papers#${id}`
  return `/docs/papers#${id}`
}

export function ImplementBoard() {
  const [params, setParams] = useSearchParams()
  const showDone = params.get('done') === '1'
  const [items, setItems] = useState<ImplementView[]>([])
  const [doneCount, setDoneCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<Exclude<ImplementStatus, 'implemented'>>('discuss')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = (done = showDone) => {
    const qs = done ? '?done=1' : ''
    void fetch(apiUrl(`/api/implement${qs}`))
      .then((r) => r.json())
      .then((data: { items?: ImplementView[]; doneCount?: number; activeCount?: number }) => {
        setItems(data.items ?? [])
        setDoneCount(data.doneCount ?? 0)
        setActiveCount(data.activeCount ?? 0)
      })
      .catch(() => setErr('implement queue unavailable'))
  }

  useEffect(() => {
    load(showDone)
  }, [showDone])

  const onAdd = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      setErr('Title is required.')
      return
    }
    setErr('')
    const res = await fetch(apiUrl('/api/implement'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), note: note.trim(), status }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || data.ok === false) {
      setErr(data.error || 'save failed')
      return
    }
    setTitle('')
    setNote('')
    setStatus('discuss')
    setMsg('wrote to the queue')
    load(showDone)
  }

  const onComplete = async (id: string) => {
    setErr('')
    const res = await fetch(apiUrl('/api/implement/complete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || data.ok === false) {
      setErr(data.error || 'complete failed')
      return
    }
    setMsg('erased from the active list — kept in the implemented archive')
    load(showDone)
  }

  const toggleArchive = () => {
    const next = !showDone
    const copy = new URLSearchParams(params)
    if (next) copy.set('done', '1')
    else copy.delete('done')
    setParams(copy, { replace: true })
  }

  return (
    <section className="work-queue" aria-labelledby="work-queue-h">
      <header className="work-queue-head">
        <p className="work-queue-kicker">Work queue · not the page tree</p>
        <h2 id="work-queue-h">To-implement</h2>
        <p className="work-queue-lede">
          Write items we will do. Erase them from this list when they are <strong>implemented</strong> —
          the row stays on disk as an audit trail. Overview is the live page map; this is the committed
          work queue. Status words: <strong>discuss</strong> (thinking), <strong>will-implement</strong>{' '}
          (decided, not built), <strong>implemented</strong> (done). Never “production.”
        </p>
        <p className="work-queue-counts">
          {activeCount} active · {doneCount} implemented
        </p>
        <button type="button" className="work-queue-toggle" aria-pressed={showDone} onClick={toggleArchive}>
          {showDone ? 'Hide implemented archive' : 'Show implemented archive'}
        </button>
      </header>
      {err ? (
        <p className="work-queue-err" role="alert">
          {err}
        </p>
      ) : null}
      {msg ? <p className="work-queue-ok">{msg}</p> : null}
      <ol className="work-queue-list">
        {items.length ? (
          items.map((item) => (
            <li key={item.id} className={`work-ticket work-ticket-${item.status}`}>
              <div className="work-ticket-meta">
                <span className="work-status">{item.status}</span>
                <code>{item.id}</code>
              </div>
              <h3>{item.title}</h3>
              {item.note ? <p>{item.note}</p> : null}
              {item.related.length ? (
                <p className="work-related">
                  {item.related.map((id) => (
                    <Link key={id} to={hrefFor(id)}>
                      {id}
                    </Link>
                  ))}
                </p>
              ) : null}
              {item.status !== 'implemented' ? (
                <button type="button" className="work-queue-act" onClick={() => void onComplete(item.id)}>
                  Mark implemented
                </button>
              ) : (
                <p className="work-archived">Implemented {item.implementedAt ?? item.updatedAt}</p>
              )}
            </li>
          ))
        ) : (
          <li className="work-ticket work-ticket-empty">
            {showDone ? 'No implemented items in the archive.' : 'No active items.'}
          </li>
        )}
      </ol>
      <form className="work-queue-form" onSubmit={(e) => void onAdd(e)}>
        <h3>Write a new item</h3>
        <label htmlFor="impl-title">
          Title <span className="work-req">(required)</span>
        </label>
        <input
          id="impl-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="What we will implement"
        />
        <label htmlFor="impl-status">Status (required)</label>
        <select
          id="impl-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Exclude<ImplementStatus, 'implemented'>)}
        >
          <option value="discuss">discuss — thinking</option>
          <option value="will-implement">will-implement — decided, not built</option>
        </select>
        <label htmlFor="impl-note">
          Note <span className="work-opt">(optional)</span>
        </label>
        <textarea
          id="impl-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Constraint, page, or why"
        />
        <button type="submit">Add to queue</button>
      </form>
    </section>
  )
}
