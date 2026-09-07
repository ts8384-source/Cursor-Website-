import { useState } from 'react'
import { apiUrl } from '../api'

type Props = { visible: boolean }

/** Destructive dump of data/docs. Handbook 13:2 label, 13:11 confirm before the error is permanent. */
export function RemoveDocWiki({ visible }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')

  if (!visible) return null

  const onRemove = async () => {
    setErr('')
    setStatus('removing…')
    const res = await fetch(apiUrl('/api/docs/remove'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true, phrase: 'Are you sure' }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; alreadyGone?: boolean }
    if (!res.ok || data.ok === false) {
      setStatus('')
      setErr(data.error || 'could not remove the doc wiki')
      return
    }
    setStatus(data.alreadyGone ? 'Doc wiki folder was already gone.' : 'Doc wiki folder removed. Boot wiki is unchanged.')
    setOpen(false)
    window.location.assign('/site/overview')
  }

  return (
    <section className="doc-dump" aria-label="Remove framework doc wiki">
      <h2 className="doc-dump-title">Throw away the framework docs</h2>
      <p>
        This deletes the folder <code>data/docs</code> only. The boot wiki, papers, and boards stay. Handbook 13:2 /
        13:11: the action is labeled, and it asks before it runs.
      </p>
      {!open ? (
        <button type="button" className="doc-dump-btn" onClick={() => setOpen(true)}>
          Remove doc wiki
        </button>
      ) : (
        <div className="doc-dump-confirm" role="alertdialog" aria-labelledby="doc-dump-ask">
          <p id="doc-dump-ask">
            <strong>Are you sure?</strong> The framework explain site will be gone until you restore{' '}
            <code>data/docs</code>.
          </p>
          <div className="doc-dump-actions">
            <button type="button" className="doc-dump-btn doc-dump-btn-danger" onClick={() => void onRemove()}>
              Yes, remove doc wiki
            </button>
            <button type="button" className="doc-dump-btn doc-dump-cancel" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {status ? <p role="status">{status}</p> : null}
      {err ? <p className="site-error">{err}</p> : null}
    </section>
  )
}
