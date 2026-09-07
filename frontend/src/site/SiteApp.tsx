import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiUrl } from '../api'
import { renderMarkdown } from './markdown'
import { DiagramsBoard } from './DiagramsBoard'
import { ExecutionBoard } from './ExecutionBoard'
import { MapsBoard } from './MapsBoard'
import { MemoryBoard } from './MemoryBoard'
import { PaperCatalog } from './PaperCatalog'
import { OpenOnIpad } from './OpenOnIpad'
import { SearchRail } from './SearchRail'
import { SummariesBoard } from './SummariesBoard'
import { JumpToGraph, KnowledgeGraphBoard } from './KnowledgeGraphBoard'
import { OverviewStructure } from './OverviewStructure'
import { ImplementBoard } from './ImplementBoard'
import { RemoveDocWiki } from './RemoveDocWiki'
import { SandboxBoard } from './SandboxBoard'
import { SandboxFlagControl } from './SandboxFlagControl'
import { SandboxTrashControl, TrashBinBoard } from './SandboxTrashControl'
import { buildPageTree, crumbTrail } from './pageTree'
import { WikiPageTree } from './WikiPageTree'
import type { PageDoc, PageMeta, PageTreeNode, PaperRecord, SearchHit } from './types'

export function SiteRedirect() {
  return <Navigate to="/site/overview" replace />
}

export function DocsRedirect() {
  return <Navigate to="/docs/docs-home" replace />
}

export function SiteApp({ bin = 'boot' }: { bin?: 'boot' | 'doc' }) {
  const { slug = bin === 'doc' ? 'docs-home' : 'overview' } = useParams()
  const [docsOn, setDocsOn] = useState(false)
  const [pages, setPages] = useState<PageMeta[]>([])
  const [tree, setTree] = useState<PageTreeNode[]>([])
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
    const load = () => {
      void fetch(apiUrl(`/api/pages?bin=${bin}`))
        .then((r) => r.json())
        .then((data: { pages?: PageMeta[]; tree?: PageTreeNode[]; docs?: { present?: boolean } }) => {
          const visible = (data.pages ?? []).filter((p) => !p.hidden)
          setPages(visible)
          setTree(data.tree?.length ? data.tree : buildPageTree(visible))
          setDocsOn(Boolean(data.docs?.present))
        })
        .catch(() => setErr('pages unavailable'))
    }
    load()
    window.addEventListener('sandbox-pages-changed', load)
    return () => window.removeEventListener('sandbox-pages-changed', load)
  }, [bin])

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
    document.title = page ? `${page.title} — ${bin === 'doc' ? 'Framework docs' : 'Site'}` : bin === 'doc' ? 'Framework docs' : 'Site'
  }, [page, bin])

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
  const crumbs = crumbTrail(pages, slug)
  const home = bin === 'doc' ? '/docs/docs-home' : '/site/overview'
  const papersHref = docsOn ? '/docs/papers' : '/site/papers'

  if (page?.bin && page.bin !== bin && page.href) {
    return <Navigate to={page.href} replace />
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#article">
        Skip navigation
      </a>
      <header className="site-top">
        <span className="site-brand">{bin === 'doc' ? 'Framework docs' : 'Boot wiki'}</span>
        <Link className="site-home" to="/site/overview">
          Boot wiki
        </Link>
        {docsOn ? (
          <Link className="site-home" to="/docs/docs-home">
            Framework docs
          </Link>
        ) : null}
        <Link className="site-canvas" to="/">
          Canvas
        </Link>
        <p className="crumb">
          <Link className="wiki-hl wiki-hl-start crumb-hl" to={home}>
            {bin === 'doc' ? 'Framework docs' : 'Overview'} <span className="wiki-badge wiki-badge-start">Start</span>
          </Link>
          {crumbs
            .filter((item) => item.slug !== 'overview')
            .map((item) => (
              <span key={item.slug}>
                <span aria-hidden="true"> / </span>
                {item.slug === slug ? (
                  <span className={item.highlight ? `crumb-here wiki-hl-${item.highlight}` : undefined}>
                    {item.nav}
                    {item.highlight === 'start' ? (
                      <span className="wiki-badge wiki-badge-start">Start</span>
                    ) : item.highlight === 'queue' ? (
                      <span className="wiki-badge wiki-badge-queue">Queue</span>
                    ) : item.highlight === 'lab' ? (
                      <span className="wiki-badge wiki-badge-lab">Lab</span>
                    ) : null}
                  </span>
                ) : (
                  <Link
                    className={item.highlight ? `wiki-hl wiki-hl-${item.highlight} crumb-hl` : undefined}
                    to={item.href || `/site/${item.slug}`}
                  >
                    {item.nav}
                    {item.highlight === 'queue' ? (
                      <span className="wiki-badge wiki-badge-queue">Queue</span>
                    ) : item.highlight === 'start' ? (
                      <span className="wiki-badge wiki-badge-start">Start</span>
                    ) : item.highlight === 'lab' ? (
                      <span className="wiki-badge wiki-badge-lab">Lab</span>
                    ) : null}
                  </Link>
                )}
              </span>
            ))}
        </p>
      </header>
      {err && !page ? (
        <p className="site-error">
          {bin === 'doc'
            ? 'Framework docs are not installed (data/docs missing). The boot wiki is still at /site/overview.'
            : err}
        </p>
      ) : null}
      <div className="site-body">
        <nav className="site-toc" aria-label="Site and page contents">
          <details className="rail-fold" open>
            <summary>Contents</summary>
            <h2>Pages</h2>
            <WikiPageTree tree={tree} slug={slug} variant="nav" />
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
          </details>
        </nav>
        <main id="article" className="site-article" tabIndex={-1} onClick={onArticleClick}>
          {page ? <SandboxTrashControl slug={page.slug} title={page.title} sandbox={page.sandbox} /> : null}
          <RemoveDocWiki visible={docsOn && (bin === 'doc' || slug === 'sandbox' || slug === 'docs-home')} />
          {page?.highlight === 'start' ? (
            <p className="start-banner" role="status">
              <span className="wiki-badge wiki-badge-start">Start</span>{' '}
              <strong>Fork start-here.</strong> Cream map of the live wiki — not the ticket pile. Handbook 7:2 / 9:1: grouped and labeled, not color-only.
            </p>
          ) : page?.highlight === 'queue' ? (
            <p className="queue-banner" role="status">
              <span className="wiki-badge wiki-badge-queue">Queue</span>{' '}
              <strong>Fork start-here.</strong> Slate work tickets — not the family tree. Distinct from Overview on purpose.
            </p>
          ) : page?.highlight === 'lab' ? (
            <p className="lab-banner" role="status">
              <span className="wiki-badge wiki-badge-lab">Lab</span>{' '}
              <strong>Lab bench.</strong> Agents write children here until promote to main — not encyclopedia peers. How-to is a nest child, not a lane. Handbook 7:2 / 9:1: grouped and labeled, not color-only.
            </p>
          ) : page?.tags?.includes('exploration-only') ? (
            <p className="explore-banner" role="status">
              <strong>Exploration only — not a shipping feature.</strong> This page explains an idea so it is not forgotten. Do not implement it from this article.
            </p>
          ) : page?.tags?.includes('temporary') ? (
            <p className="temp-banner" role="status">
              Temporary section. Implement-discussion or think-through — not a shipped scheme. We will rewrite this later.
            </p>
          ) : null}
          {page?.gist ? <p className="page-gist">{page.gist}</p> : null}
          {page ? (
            <>
              <OpenOnIpad
                sourceType="page"
                sourceId={page.id || `page:${page.slug}`}
                sourceSlug={page.slug}
                title={page.title}
                pageId={page.id || `page:${page.slug}`}
                paperIds={page.citations}
                citations={page.citations}
                related={page.related}
                gist={page.gist}
                capture='[data-ipad-export="page"]'
              />
              <JumpToGraph id={page.id || `page:${page.slug}`} />
            </>
          ) : null}
          <div className="site-article-body" data-ipad-export="page" dangerouslySetInnerHTML={{ __html: html }} />
          {slug === 'overview' || slug === 'docs-home' ? <OverviewStructure tree={tree} slug={slug} /> : null}
          {slug === 'overview' ? <DiagramsBoard compact /> : null}
          {slug === 'implement' ? <ImplementBoard /> : null}
          {slug === 'wiki-memory' ? <DiagramsBoard onlyPrefix="wiki-memory" /> : null}
          {slug === 'knowledge-graph' ? <KnowledgeGraphBoard /> : null}
          {slug === 'knowledge-graph' ? <DiagramsBoard onlyPrefix="flagged-schemes-graph" /> : null}
          {slug === 'agents' ? <DiagramsBoard onlyPrefix="flagged-schemes-loop" /> : null}
          {slug === 'agents-fetch' ? <DiagramsBoard onlyPrefix="flagged-schemes-fetch" /> : null}
          {slug === 'agents-coding' ? <DiagramsBoard onlyPrefix="flagged-schemes-coding" /> : null}
          {slug === 'agents-coding-generate' ? <DiagramsBoard onlyPrefix="agents-coding-generate" /> : null}
          {slug === 'agents-coding-debug' ? <DiagramsBoard onlyPrefix="agents-coding-debug" /> : null}
          {slug === 'agents-generate' ? <DiagramsBoard onlyPrefix="flagged-schemes-generate" /> : null}
          {slug === 'metadata' ? <DiagramsBoard onlyPrefix="metadata" /> : null}
          {slug === 'papers' ? <PaperCatalog papers={papers} onRefresh={loadPapers} /> : null}
          {slug === 'summaries' ? <SummariesBoard /> : null}
          {slug === 'diagrams' ? <DiagramsBoard /> : null}
          {slug === 'maps' ? <MapsBoard /> : null}
          {slug === 'memory' ? <MemoryBoard /> : null}
          {slug === 'execution' ? <ExecutionBoard /> : null}
          {page ? <SandboxFlagControl slug={page.slug} sandbox={page.sandbox} /> : null}
          <TrashBinBoard hostSlug={page?.slug || slug} />
          <SandboxBoard hostId={page?.id || (page ? `page:${page.slug}` : undefined)} hostSlug={page?.slug || slug} />
        </main>
        <aside className="site-rail" aria-label="Reading aids">
          <details className="rail-fold" open>
            <summary>Reading aids</summary>
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
                    <Link className="cite-card" to={`${papersHref}#${p.id}`}>
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
          </details>
        </aside>
      </div>
    </div>
  )
}
