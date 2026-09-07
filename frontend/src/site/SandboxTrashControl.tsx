import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from '../api'

type TrashItem = {
  slug: string
  title?: string
  href?: string
  trashedAt?: string
  forgottenAt?: string
  forgotten?: boolean
}

type Props = {
  slug: string
  title: string
  sandbox?: boolean
}

function canTrashFromGui(slug: string, sandbox?: boolean) {
  if (slug === 'sandbox' || slug === 'sandbox-how-the-lab-works') return false
  return Boolean(sandbox)
}

export function SandboxTrashControl({ slug, title, sandbox }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'live' | 'trashed' | 'forgotten'>('live')
  const [err, setErr] = useState('')
  const [status, setStatus] = useState('')

  const load = () => {
    void fetch(apiUrl('/api/sandbox/trash?forgotten=1'))
      .then((r) => r.json())
      .then((data: { items?: TrashItem[]; forgotten?: TrashItem[] }) => {
        const all = [...(data.items ?? []), ...(data.forgotten ?? [])]
        const row = all.find((item) => item.slug === slug)
        if (!row) setState('live')
        else if (row.forgotten) setState('forgotten')
        else setState('trashed')
      })
      .catch(() => undefined)
  }

  useEffect(() => {
    if (!canTrashFromGui(slug, sandbox)) return
    load()
  }, [slug, sandbox])

  if (!canTrashFromGui(slug, sandbox)) return null

  const moveToTrash = async () => {
    setErr('')
    const res = await fetch(apiUrl('/api/sandbox/trash'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    const body = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || body.ok === false) {
      setErr(body.error || 'could not move to Trash bin')
      return
    }
    setOpen(false)
    setState('trashed')
    window.dispatchEvent(new Event('sandbox-pages-changed'))
    navigate('/site/sandbox')
  }

  const restore = async () => {
    setErr('')
    const res = await fetch(apiUrl('/api/sandbox/trash/restore'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    const body = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || body.ok === false) {
      setErr(body.error || 'restore failed')
      return
    }
    setState('live')
    setStatus('Restored to the Lab bench.')
    window.dispatchEvent(new Event('sandbox-pages-changed'))
  }

  return (
    <div className="lab-trash">
      {state === 'live' ? (
        <button type="button" className="lab-trash-launch" onClick={() => setOpen(true)}>
          Move to Trash bin
        </button>
      ) : state === 'trashed' ? (
        <button type="button" className="lab-trash-launch" onClick={() => void restore()}>
          Restore from Trash bin
        </button>
      ) : (
        <span className="lab-trash-forgotten">Forgotten after two weeks</span>
      )}
      {status ? (
        <p className="sandbox-ok" role="status">
          {status}
        </p>
      ) : null}
      {err ? <p className="sandbox-err">{err}</p> : null}
      {open ? (
        <div className="lab-trash-modal" role="dialog" aria-modal="true" aria-labelledby="lab-trash-title">
          <div className="lab-trash-panel">
            <h2 id="lab-trash-title">Are you sure you want to delete?</h2>
            <p>
              This moves <strong>{title}</strong> to the <Link to="/site/sandbox">Trash bin on Lab bench</Link>. It leaves
              the live lab tree now. After two weeks it is forgotten from agent pickup. Encyclopedia pages cannot be
              dumped here. Handbook <strong>13:2</strong> (name the action), <strong>13:4</strong> / <strong>13:5</strong>{' '}
              (clear labels).
            </p>
            <div className="lab-trash-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="lab-trash-confirm" onClick={() => void moveToTrash()}>
                Move to Trash bin
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function TrashBinBoard({ hostSlug }: { hostSlug?: string }) {
  const [items, setItems] = useState<TrashItem[]>([])
  const [err, setErr] = useState('')

  const load = () => {
    void fetch(apiUrl('/api/sandbox/trash'))
      .then((r) => r.json())
      .then((data: { items?: TrashItem[] }) => setItems(data.items ?? []))
      .catch(() => setErr('trash unavailable'))
  }

  useEffect(() => {
    if (hostSlug !== 'sandbox') return
    load()
    const onChange = () => load()
    window.addEventListener('sandbox-pages-changed', onChange)
    return () => window.removeEventListener('sandbox-pages-changed', onChange)
  }, [hostSlug])

  if (hostSlug !== 'sandbox') return null

  const restore = async (slug: string) => {
    setErr('')
    const res = await fetch(apiUrl('/api/sandbox/trash/restore'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    const body = (await res.json()) as { ok?: boolean; error?: string }
    if (!res.ok || body.ok === false) {
      setErr(body.error || 'restore failed')
      return
    }
    window.dispatchEvent(new Event('sandbox-pages-changed'))
    load()
  }

  return (
    <section className="trash-bin-board" aria-labelledby="trash-bin-heading">
      <h2 id="trash-bin-heading">Trash bin</h2>
      <p>
        Lab-bench pages only. Two weeks after the move they are forgotten. Papers and encyclopedia pages do not decay.
      </p>
      {err ? <p className="sandbox-err">{err}</p> : null}
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.slug}>
              <Link to={item.href || `/site/${item.slug}`}>{item.title || item.slug}</Link>
              <button type="button" onClick={() => void restore(item.slug)}>
                Restore from Trash bin
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Trash bin is empty.</p>
      )}
    </section>
  )
}
