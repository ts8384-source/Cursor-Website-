import { useEffect, useState } from 'react'
import { apiUrl } from '../api'

function looksLikeIPad() {
  return navigator.maxTouchPoints > 1 && /iPad|Macintosh|iPhone/i.test(navigator.userAgent)
}

type PairInfo = {
  urls?: string[]
  pad?: string
  site?: string
  siteLan?: string
}

export function PairingCard() {
  const [info, setInfo] = useState<PairInfo>({})
  const [hidden, setHidden] = useState(() => looksLikeIPad())

  useEffect(() => {
    if (hidden) return
    void fetch(apiUrl('/api/pair'))
      .then((r) => r.json())
      .then((data: PairInfo) => setInfo(data))
      .catch(() => setInfo({}))
  }, [hidden])

  if (hidden) return null

  const pad = info.pad || info.urls?.[0] || 'http://100.107.135.79:5174/'
  const site = info.site || 'http://127.0.0.1:5174/site/overview'
  const siteLan = info.siteLan

  return (
    <aside className="pairing">
      <p>Open Safari on the iPad</p>
      <label className="pairing-label pairing-label-pad">
        iPad Safari (Tailscale) — stay on this URL
        <code className="pairing-pad-url">{pad}</code>
      </label>
      <label className="pairing-label">
        This PC (website)
        <code>{site}</code>
      </label>
      {siteLan ? (
        <label className="pairing-label">
          This PC (LAN)
          <code>{siteLan}</code>
        </label>
      ) : null}
      <p className="pairing-hint">
        Leave Safari on the Tailscale pad URL. Use the PC website URL in a desktop browser. Then dismiss this.
      </p>
      <button type="button" onClick={() => setHidden(true)}>
        I&apos;m on the pad
      </button>
    </aside>
  )
}
