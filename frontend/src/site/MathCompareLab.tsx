import { useEffect, useId, useRef, useState } from 'react'
import katex from 'katex'
import { JSXGraph } from 'jsxgraph'
import 'katex/dist/katex.min.css'
import 'mathlive'
import 'mathlive/fonts.css'
// jsxgraph package exports omit CSS; load from the installed file.
import '../../../node_modules/jsxgraph/distrib/jsxgraph.css'

/** Same successor-features samples — four renderers, one page (handbook 9:1 / 16:6). */
const SAMPLES = [
  {
    id: 'sf-def',
    label: 'Successor features (definition)',
    tex: String.raw`\psi \approx \mathbb{E}\left[\sum_{t=0}^{\infty} \gamma^{t} \varphi_{n+t} \mid \text{start at } n\right]`,
    note: 'Discounted future φ. This is what you run.',
  },
  {
    id: 'sf-backup',
    label: 'One-step backup',
    tex: String.raw`\psi_n \approx \varphi_n + \gamma\,\psi_{n+1}`,
    note: 'Same idea as a Dayan SR row, on features.',
  },
  {
    id: 'sf-td',
    label: 'Occupancy residual',
    tex: String.raw`\delta_n = \psi_n - \operatorname{sg}\!\left[\varphi_{n+1} + \gamma\,\psi_{n+1}\right]`,
    note: 'What a learning signal can read.',
  },
] as const

type LibId = 'katex' | 'mathjax' | 'mathlive' | 'jsxgraph'

const LIBS: { id: LibId; title: string; role: string }[] = [
  { id: 'katex', title: 'KaTeX', role: 'Fast static TeX → HTML/CSS' },
  { id: 'mathjax', title: 'MathJax', role: 'Full TeX engine, accessibility-friendly' },
  { id: 'mathlive', title: 'MathLive', role: 'Editable math field (type / tweak)' },
  { id: 'jsxgraph', title: 'JSXGraph', role: 'Interactive geometry / plots around the math' },
]

type MathJaxApi = {
  typesetPromise?: (nodes?: Element[]) => Promise<void>
  tex?: unknown
  startup?: {
    promise?: Promise<void>
    defaultReady?: () => void
    ready?: () => void
    typeset?: boolean
  }
}

declare global {
  interface Window {
    MathJax?: MathJaxApi
  }
}

let mathJaxLoader: Promise<MathJaxApi> | null = null

function loadMathJax(): Promise<MathJaxApi> {
  if (window.MathJax?.typesetPromise) return Promise.resolve(window.MathJax)
  if (mathJaxLoader) return mathJaxLoader
  mathJaxLoader = new Promise<MathJaxApi>((resolve, reject) => {
    const done = (api: MathJaxApi | undefined) => {
      if (api?.typesetPromise) resolve(api)
      else reject(new Error('MathJax loaded without typesetPromise'))
    }
    const waitForApi = () => {
      const t0 = Date.now()
      const tick = () => {
        if (window.MathJax?.typesetPromise) {
          done(window.MathJax)
          return
        }
        if (Date.now() - t0 > 20_000) {
          reject(new Error('MathJax timeout'))
          return
        }
        window.setTimeout(tick, 40)
      }
      tick()
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-mathjax-lab]')
    if (existing) {
      waitForApi()
      return
    }

    // Config must be set before the component script runs.
    window.MathJax = {
      tex: {
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)'],
        ],
        displayMath: [
          ['$$', '$$'],
          ['\\[', '\\]'],
        ],
      },
      startup: {
        typeset: false,
      },
    } as MathJaxApi

    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'
    s.async = true
    s.dataset.mathjaxLab = '1'
    s.onload = () => waitForApi()
    s.onerror = () => reject(new Error('MathJax CDN failed'))
    document.head.appendChild(s)
  })
  return mathJaxLoader
}

function KatexPanel({ tex }: { tex: string }) {
  let html = ''
  let err = ''
  try {
    html = katex.renderToString(tex, { throwOnError: true, displayMode: true })
  } catch (e) {
    err = e instanceof Error ? e.message : 'KaTeX failed'
  }
  if (err) return <p className="math-lab-err" role="alert">{err}</p>
  return <div className="math-lab-render" dangerouslySetInnerHTML={{ __html: html }} />
}

function MathJaxPanel({ tex }: { tex: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Loading MathJax…')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const mj = await loadMathJax()
        if (cancelled || !host.current) return
        host.current.innerHTML = `\\[${tex}\\]`
        await mj.typesetPromise?.([host.current])
        if (!cancelled) setStatus('')
      } catch (e) {
        if (!cancelled) setStatus(e instanceof Error ? e.message : 'MathJax failed')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [tex])

  return (
    <div className="math-lab-render">
      {status ? <p className="math-lab-status">{status}</p> : null}
      <div ref={host} />
    </div>
  )
}

function MathLivePanel({ tex }: { tex: string }) {
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = wrap.current
    if (!host) return
    host.replaceChildren()
    const field = document.createElement('math-field') as HTMLElement & { value: string }
    field.style.width = '100%'
    field.style.fontSize = '1.15rem'
    field.style.minHeight = '44px'
    field.setAttribute('virtual-keyboard-mode', 'manual')
    field.value = tex
    host.appendChild(field)
  }, [tex])

  return (
    <div className="math-lab-render math-lab-live">
      <div ref={wrap} />
      <p className="math-lab-hint">Click the field and edit — MathLive only.</p>
    </div>
  )
}

type SliderEl = { Value: () => number }

function JsxGraphPanel({ sampleIndex }: { sampleIndex: number }) {
  const boxId = `jxg-${useId().replace(/:/g, '')}`

  useEffect(() => {
    const board = JSXGraph.initBoard(boxId, {
      boundingbox: [-0.2, 1.15, 12.5, -0.15],
      axis: true,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: false },
    })

    const gamma = board.create(
      'slider',
      [
        [0.5, 1.0],
        [4.5, 1.0],
        [0.5, 0.9, 0.99],
      ],
      { name: 'γ', snapWidth: 0.01, precision: 2 },
    ) as unknown as SliderEl

    board.create(
      'functiongraph',
      [(t: number) => Math.pow(Number(gamma.Value()), t), 0, 12],
      { strokeColor: '#0b3d8c', strokeWidth: 2 },
    )

    board.create(
      'text',
      [
        6.2,
        0.85,
        () => {
          const g = Number(gamma.Value()).toFixed(2)
          if (sampleIndex === 0) return `discount weights γ^t (γ=${g})`
          if (sampleIndex === 1) return `backup mixes φ_n with γ·ψ (γ=${g})`
          return `TD target uses γ (γ=${g})`
        },
      ],
      { fontSize: 14 },
    )

    return () => {
      JSXGraph.freeBoard(board)
    }
  }, [boxId, sampleIndex])

  return (
    <div className="math-lab-render">
      <p className="math-lab-hint">
        Interactive γ^t decay — JSXGraph plot tied to the same samples (not TeX glyphs).
      </p>
      <div
        id={boxId}
        className="math-lab-jxg"
        role="img"
        aria-label="Discount factor gamma to the t as an interactive plot"
      />
    </div>
  )
}

export function MathCompareLab() {
  const [sampleIdx, setSampleIdx] = useState(0)
  const sample = SAMPLES[sampleIdx]

  return (
    <section className="math-lab" aria-labelledby="math-lab-title">
      <header className="math-lab-head">
        <h2 id="math-lab-title">Math render compare</h2>
        <p>
          Lab compare of four libraries on the same successor-features samples. <strong>Framework default is now
          KaTeX</strong> for all wiki `$…$` / `eq` fences — see <a href="/docs/math-rendering">Math rendering</a>.
          JSXGraph stays for interactive prototypes (handbook 9:1 / 16:6).
        </p>
      </header>

      <nav className="math-lab-samples" aria-label="Equation samples">
        {SAMPLES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={i === sampleIdx ? 'is-active' : undefined}
            aria-pressed={i === sampleIdx}
            onClick={() => setSampleIdx(i)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <p className="math-lab-note">
        <strong>{sample.label}.</strong> {sample.note}
      </p>
      <pre className="math-lab-source" tabIndex={0}>
        <code>{sample.tex}</code>
      </pre>

      <ol className="math-lab-toc">
        {LIBS.map((lib) => (
          <li key={lib.id}>
            <a href={`#math-lab-${lib.id}`}>{lib.title}</a>
          </li>
        ))}
      </ol>

      <div className="math-lab-grid">
        {LIBS.map((lib) => (
          <section
            key={lib.id}
            id={`math-lab-${lib.id}`}
            className="math-lab-panel"
            aria-labelledby={`math-lab-h-${lib.id}`}
          >
            <h3 id={`math-lab-h-${lib.id}`}>{lib.title}</h3>
            <p className="math-lab-role">{lib.role}</p>
            {lib.id === 'katex' ? <KatexPanel tex={sample.tex} /> : null}
            {lib.id === 'mathjax' ? <MathJaxPanel tex={sample.tex} /> : null}
            {lib.id === 'mathlive' ? <MathLivePanel tex={sample.tex} /> : null}
            {lib.id === 'jsxgraph' ? <JsxGraphPanel sampleIndex={sampleIdx} /> : null}
          </section>
        ))}
      </div>

      <p className="math-lab-next">
        Next step (placeholder):{' '}
        <a href="/site/ml-module-dataflow">ML module data flow</a> — React Flow between modules, not TeX.
      </p>
    </section>
  )
}
