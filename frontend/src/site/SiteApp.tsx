import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { apiUrl } from '../api'
import { renderMarkdown } from './markdown'
import { OpenOnIpad } from './OpenOnIpad'
import { SearchRail } from './SearchRail'
import { JumpToGraph } from './KnowledgeGraphBoard'
import { RemoveDocWiki } from './RemoveDocWiki'
import { SiteMenus } from './SiteMenus'
import { SiteRailFold } from './SiteRailFold'
import { SandboxBoard } from './SandboxBoard'
import { SandboxFlagControl } from './SandboxFlagControl'
import { SandboxTrashControl, TrashBinBoard } from './SandboxTrashControl'
import { PageEmbeds } from './embeds'
import { buildPageTree, crumbTrail } from './pageTree'
import { allTopics, owningTopic, sectionId, topicChildren, topicRootFor, topicSubpages } from './topic'
import type { PageDoc, PageMeta, PageTreeNode, PaperRecord, SearchHit } from './types'

export function SiteRedirect() {
  return <Navigate to="/site/overview" replace />
}

export function DocsRedirect() {
  return <Navigate to="/docs/docs-home" replace />
}

export function SiteApp({ bin = 'boot' }: { bin?: 'boot' | 'doc' }) {
  const { slug = bin === 'doc' ? 'docs-home' : 'overview' } = useParams()
  const { hash } = useLocation()
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
  const [childDocs, setChildDocs] = useState<PageDoc[]>([])

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

  // A topic renders its children as sections of the same page, so reading a subject is one scroll.
  const childSlugs = useMemo(() => topicChildren(page, pages).map((c) => c.slug), [page, pages])
  const childKey = childSlugs.join(',')

  useEffect(() => {
    if (!childKey) {
      setChildDocs([])
      return
    }
    let cancelled = false
    void Promise.all(
      childKey.split(',').map((s) =>
        fetch(apiUrl(`/api/pages/${encodeURIComponent(s)}`))
          .then((r) => (r.ok ? (r.json() as Promise<PageDoc>) : null))
          .catch(() => null),
      ),
    ).then((docs) => {
      if (!cancelled) setChildDocs(docs.filter((d): d is PageDoc => Boolean(d)))
    })
    return () => {
      cancelled = true
    }
  }, [childKey])

  // Children shift one heading level down, so their own `# Title` becomes the section head (handbook 9:7).
  const sections = useMemo(
    () => childDocs.map((doc) => ({ doc, ...renderMarkdown(doc.body, doc.glossary, doc.slug, 1) })),
    [childDocs],
  )

  /**
   * The rail is an index, not the text (handbook 7:3). A topic page is stitched from several MD
   * docs, so the docs are its seams — one line each, no headings from inside them. A page with no
   * children has no seams, so its own H2s are the coarsest unit available.
   */
  const railToc = useMemo(() => {
    if (!sections.length) {
      return toc.filter((t) => t.level === 2).map((t) => ({ id: t.id, text: t.text, level: 2 }))
    }
    const lead = toc.find((t) => t.level === 1)
    const items = lead ? [{ id: lead.id, text: lead.text, level: 2 }] : []
    for (const s of sections) {
      const head = s.toc.find((t) => t.level === 2)
      items.push({ id: head?.id ?? sectionId(s.doc.slug), text: s.doc.nav || s.doc.title, level: 2 })
    }
    return items
  }, [toc, sections])

  /**
   * Mark the seam being read: the last one whose heading has passed under the sticky header.
   * Measured on scroll rather than observed, so the mark holds steady through a long section and
   * cannot be left stale by content that mounts late (diagrams, boards).
   */
  const scrolly = page?.scrolly ?? false
  useEffect(() => {
    const ids = railToc.map((t) => t.id)
    if (!ids.length) return
    let frame = 0
    const lastPassed = (nodes: (Element | null)[]) => {
      let idx = -1
      nodes.forEach((n, i) => {
        if (n && n.getBoundingClientRect().top <= 80) idx = i
      })
      return idx
    }
    const measure = () => {
      frame = 0
      const idx = lastPassed(ids.map((id) => document.getElementById(id)))
      setActiveHeading(ids[idx >= 0 ? idx : 0])
      if (!scrolly) return
      const step = lastPassed([...document.querySelectorAll('.site-article h3')])
      if (step >= 0) setActiveStep(step)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [railToc, scrolly, html, sections])

  // The article arrives after the browser has already tried the hash, and boards keep loading under it,
  // so re-aim at the anchor for a beat until the page stops moving.
  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    let tries = 0
    let timer = 0
    const settle = () => {
      const target = document.getElementById(id)
      if (target && Math.abs(target.getBoundingClientRect().top - 72) > 4) {
        target.scrollIntoView({ block: 'start' })
      }
      if (++tries < 10) timer = window.setTimeout(settle, 120)
    }
    settle()
    return () => window.clearTimeout(timer)
  }, [hash, html, sections])

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
  const subpages = topicSubpages(page, pages)
  const topics = allTopics(pages)
  const openTopic = owningTopic(page, pages)
  const here = topics.findIndex((t) => t.slug === openTopic?.slug)
  const nextTopic = here >= 0 ? topics[here + 1] : undefined
  const prevTopic = here > 0 ? topics[here - 1] : undefined
  const embedCtx = { slug, tree, papers, reloadPapers: loadPapers }
  const crumbs = crumbTrail(pages, slug)
  const home = bin === 'doc' ? '/docs/docs-home' : '/site/overview'
  const papersHref = docsOn ? '/docs/papers' : '/site/papers'

  if (page?.bin && page.bin !== bin && page.href) {
    return <Navigate to={page.href} replace />
  }

  // A child now lives inside its topic. Old /site/<child> links resolve to that section.
  const owner = pages.length ? topicRootFor(slug, pages) : null
  if (owner) {
    return <Navigate to={`${owner.href || `/site/${owner.slug}`}#${sectionId(slug)}`} replace />
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#article">
        Skip navigation
      </a>
      <header className="site-top">
        {bin === 'doc' ? <span className="site-brand">Framework docs</span> : null}
        <SiteMenus bin={bin} docsOn={docsOn} pages={pages} />
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
        <nav className="site-toc" aria-label="Sections and topics">
          <SiteRailFold title="Contents">
            {railToc.length ? (
              <section className="toc-block toc-block-article" aria-labelledby="toc-article-heading">
                <h2 id="toc-article-heading">On this page</h2>
                <ol className="toc-article">
                  {railToc.map((item) => (
                    <li key={item.id} className={`toc-l${item.level}`}>
                      <a className={item.id === activeHeading ? 'is-current' : undefined} href={`#${item.id}`}>
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
            {topics.length ? (
              <section className="toc-block toc-block-topics" aria-labelledby="toc-topics-heading">
                <h2 id="toc-topics-heading">Topics</h2>
                <ul className="toc-topics">
                  {topics.map((t) => (
                    <li key={t.slug}>
                      <Link
                        className={t.slug === openTopic?.slug ? 'is-current' : undefined}
                        to={t.href || `/site/${t.slug}`}
                      >
                        {t.nav || t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </SiteRailFold>
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
          {sections.map((s) => (
            <section key={s.doc.slug} id={sectionId(s.doc.slug)} className="topic-section">
              <div className="site-article-body" dangerouslySetInnerHTML={{ __html: s.html }} />
              <PageEmbeds names={s.doc.embeds} ctx={{ ...embedCtx, slug: s.doc.slug }} />
            </section>
          ))}
          <PageEmbeds names={page?.embeds} ctx={embedCtx} />
          {subpages.length ? (
            <section className="topic-subpages" aria-labelledby="topic-subpages-h">
              <h2 id="topic-subpages-h">Deep dives</h2>
              <p className="topic-subpages-note">
                Longer studies kept off this page — a single paper, an experiment log, an appendix.
              </p>
              <ul>
                {subpages.map((p) => (
                  <li key={p.slug}>
                    <Link to={p.href || `/site/${p.slug}`}>{p.nav || p.title}</Link>
                    {p.gist ? <span className="topic-subpage-gist">{p.gist}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {prevTopic || nextTopic ? (
            <nav className="topic-move" aria-label="Previous and next topic">
              {prevTopic ? (
                <Link className="topic-move-prev" to={prevTopic.href || `/site/${prevTopic.slug}`}>
                  <span>Previous</span>
                  {prevTopic.nav || prevTopic.title}
                </Link>
              ) : (
                <span />
              )}
              {nextTopic ? (
                <Link className="topic-move-next" to={nextTopic.href || `/site/${nextTopic.slug}`}>
                  <span>Next</span>
                  {nextTopic.nav || nextTopic.title}
                </Link>
              ) : null}
            </nav>
          ) : null}
          {page ? <SandboxFlagControl slug={page.slug} sandbox={page.sandbox} /> : null}
          <TrashBinBoard hostSlug={page?.slug || slug} />
          <SandboxBoard hostId={page?.id || (page ? `page:${page.slug}` : undefined)} hostSlug={page?.slug || slug} />
        </main>
        <aside className="site-rail" aria-label="Reading aids">
          <SiteRailFold title="Reading aids">
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
          </SiteRailFold>
        </aside>
      </div>
    </div>
  )
}
