import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiUrl } from '../api'
import { renderMarkdown } from './markdown'
import { PaperCatalog } from './PaperCatalog'
import { SearchRail } from './SearchRail'
import type { PageDoc, PageMeta, PaperRecord, SearchHit } from './types'

export function SiteRedirect() {
  return <Navigate to="/site/overview" replace />
}

export function SiteApp() {
  const { slug = 'overview' } = useParams()
  const [pages, setPages] = useState<PageMeta[]>([])
  const [page, setPage] = useState<PageDoc | null>(null)
  const [papers, setPapers] = useState<PaperRecord[]>([])
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [activeHeading, setActiveHeading] = useState('')

  const loadPapers = () => {
    void fetch(apiUrl('/api/papers'))
      .then((r) => r.json())
      .then((data: { papers?: PaperRecord[] }) => setPapers(data.papers ?? []))
  }

  useEffect(() => {
    void fetch(apiUrl('/api/pages'))
      .then((r) => r.json())
      .then((data: { pages?: PageMeta[] }) => setPages(data.pages ?? []))
      .catch(() => setErr('pages unavailable'))
  }, [])

  useEffect(() => {
    let cancelled = false
    setErr('')
    void fetch(apiUrl(`/api/pages/${encodeURIComponent(slug)}`))
      .then(async (r) => {
        if (!r.ok) throw new Error('page not found')
        return r.json() as Promise<PageDoc>
      })
      .then((doc) => {
        if (!cancelled) setPage(doc)
      })
      .catch(() => {
        if (!cancelled) {
          setPage(null)
          setErr('page not found')
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    loadPapers()
  }, [])

  useEffect(() => {
    document.title = page ? `${page.title} — Site` : 'Site'
  }, [page])

  const { html, toc } = useMemo(
    () => renderMarkdown(page?.body ?? '', page?.glossary ?? []),
    [page],
  )

  useEffect(() => {
    const nodes = [...document.querySelectorAll('.site-article h1, .site-article h2, .site-article h3')]
    if (!nodes.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!vis?.target.id) return
        setActiveHeading(vis.target.id)
        if (!page?.scrolly) return
        const h3s = [...document.querySelectorAll('.site-article h3')]
        const idx = h3s.findIndex((n) => n.id === vis.target.id)
        if (idx >= 0) setActiveStep(idx)
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.15, 0.5] },
    )
    for (const node of nodes) io.observe(node)
    return () => io.disconnect()
  }, [page, html])

  const onSearch = async (event: FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    setStatus('searching…')
    setErr('')
    const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}`))
    const data = (await res.json()) as { ok?: boolean; hits?: SearchHit[]; error?: string; hint?: string }
    setHits(data.hits ?? [])
    setStatus('')
    if (!res.ok || !data.ok) setErr(data.hint || data.error || 'search failed')
  }

  const onAsk = async () => {
    setStatus('asking…')
    const res = await fetch(apiUrl('/api/ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim() || 'hybrid RAG local website architecture' }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    setStatus(res.ok && data.ok !== false ? 'asked — latest dump is data/md/architecture.md' : '')
    if (!res.ok || data.ok === false) setErr(data.error || 'ask failed')
  }

  const onArticleClick = (event: MouseEvent) => {
    const btn = (event.target as HTMLElement).closest('.gist-toggle')
    if (!btn) return
    const id = btn.getAttribute('aria-controls')
    const panel = id ? document.getElementById(id) : null
    if (!panel) return
    const open = panel.hasAttribute('hidden')
    if (open) panel.removeAttribute('hidden')
    else panel.setAttribute('hidden', '')
    btn.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  const citeIds = page?.citations ?? []
  const cited = papers.length
    ? papers.filter((p) => citeIds.includes(p.id))
    : citeIds.map((id) => ({ id, title: id, list: '', authors: '', year: '', venue: '', oa_url: '', arxiv: '', file: '' }))

  const scrollySteps = page?.scrolly ? toc.filter((t) => t.level === 3) : []

  return (
    <div className="site-shell">
      <a className="skip-link" href="#article">
        Skip navigation
      </a>
      <header className="site-top">
        <span className="site-brand">Local scholarly site</span>
        <Link className="site-home" to="/site/overview">
          Site
        </Link>
        <Link className="site-canvas" to="/">
          Canvas
        </Link>
        <p className="crumb">
          <Link to="/site/overview">Overview</Link>
          {page && page.slug !== 'overview' ? (
            <>
              <span aria-hidden="true"> / </span>
              <span>{page.nav}</span>
            </>
          ) : null}
        </p>
      </header>
      {err && !page ? <p className="site-error">{err}</p> : null}
      <div className="site-body">
        <nav className="site-toc" aria-label="Site and page contents">
          <h2>Pages</h2>
          <ol className="toc-pages">
            {pages.map((item) => (
              <li key={item.slug}>
                <Link className={item.slug === slug ? 'is-active' : undefined} to={`/site/${item.slug}`}>
                  {item.nav}
                </Link>
              </li>
            ))}
          </ol>
          <h2>On this page</h2>
          <ol>
            {toc.map((item) => (
              <li key={item.id} className={`toc-l${item.level}`}>
                <a className={item.id === activeHeading ? 'is-current' : undefined} href={`#${item.id}`}>
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <main id="article" className="site-article" tabIndex={-1} onClick={onArticleClick}>
          {page?.gist ? <p className="page-gist">{page.gist}</p> : null}
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {slug === 'papers' ? <PaperCatalog papers={papers} onRefresh={loadPapers} /> : null}
        </main>
        <aside className="site-rail" aria-label="Reading aids">
          {page?.questions.length ? (
            <section>
              <h2>Key questions</h2>
              <ol className="q-list">
                {page.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </section>
          ) : null}
          {page?.glossary.length ? (
            <section>
              <h2>Terms</h2>
              <dl>
                {page.glossary.map((g) => (
                  <div key={g.term}>
                    <dt>{g.term}</dt>
                    <dd>{g.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          {citeIds.length ? (
            <section>
              <h2>Citations</h2>
              <ol className="cite-list">
                {cited.map((p) => (
                  <li key={p.id}>
                    <Link className="cite-card" to={`/site/papers#${p.id}`}>
                      <strong>{p.title || p.id}</strong>
                      <span className="paper-meta">
                        {p.authors ? `${p.authors}. ` : ''}
                        {p.year}
                        {p.venue ? `. ${p.venue}` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {scrollySteps.length ? (
            <section className="scrolly-rail" aria-label="Guided loop">
              <h2>Guided loop</h2>
              <ol>
                {scrollySteps.map((step, i) => (
                  <li key={step.id} className={i === activeStep ? 'is-active' : undefined}>
                    <a href={`#${step.id}`}>{step.text}</a>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <SearchRail
            query={query}
            onQuery={setQuery}
            hits={hits}
            status={status}
            err={page ? err : ''}
            onSearch={(e) => void onSearch(e)}
            onAsk={() => void onAsk()}
          />
        </aside>
      </div>
    </div>
  )
}
