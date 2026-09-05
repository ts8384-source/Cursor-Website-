import { useEffect, useState } from 'react'
import { apiUrl } from '../api'

function looksLikeIPad() {
  return navigator.maxTouchPoints > 1 && /iPad|Macintosh|iPhone/i.test(navigator.userAgent)
}

export function PairingCard() {
  const [urls, setUrls] = useState<string[]>([])
  const [hidden, setHidden] = useState(() => looksLikeIPad())

  useEffect(() => {
    if (hidden) return
    void fetch(apiUrl('/api/pair'))
      .then((r) => r.json())
      .then((data: { urls?: string[] }) => setUrls(data.urls ?? []))
      .catch(() => setUrls([]))
  }, [hidden])

  if (hidden) return null

  return (
    <aside className="pairing">
      <p>Open Safari on the iPad</p>
      {urls.length === 0 ? (
        <code>http://&lt;this-pc&gt;:5174/</code>
      ) : (
        urls.map((url) => <code key={url}>{url}</code>)
      )}
      <p className="pairing-hint">Same Wi‑Fi/LAN. Scribble off. Then dismiss this.</p>
      <button type="button" onClick={() => setHidden(true)}>
        I&apos;m on the pad
      </button>
    </aside>
  )
}
