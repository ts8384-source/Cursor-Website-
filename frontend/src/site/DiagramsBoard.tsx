import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from '../api'
import { GraphCanvas } from './GraphCanvas'
import { OpenOnIpad } from './OpenOnIpad'
import type { DiagramGraph, MetaRecord, PaperFigure } from './types'

function hrefFor(id: string, rec?: MetaRecord) {
  if (rec?.href) return rec.href
  if (id.startsWith('page:')) return `/site/${id.slice('page:'.length)}`
  if (id.startsWith('module:')) return `/site/${id.slice('module:'.length)}`
  if (id.startsWith('diagram:')) return '/docs/diagrams'
  if (id.startsWith('node:')) return `/docs/diagrams#${id.split(':').pop()}`
  return `/docs/papers#${id}`
}

function NodeMetaPanel({
  graphId,
  nodeId,
  label,
  catalog,
}: {
  graphId: string
  nodeId: string
  label: string
  catalog: MetaRecord[]
}) {
  const rec =
    catalog.find((r) => r.id === `node:${graphId}:${nodeId}`) ?? catalog.find((r) => r.id === nodeId)
  const pageIds = [rec?.pageId, ...(rec?.related ?? []).filter((id) => id.startsWith('page:'))].filter(
    (id, i, arr): id is string => Boolean(id) && arr.indexOf(id) === i,
  )
  const paperIds = [...(rec?.paperIds ?? []), ...(rec?.citations ?? [])].filter(
    (id, i, arr) => arr.indexOf(id) === i,
  )
  const pages = pageIds.map((id) => ({ id, rec: catalog.find((r) => r.id === id) }))
  const papers = paperIds.map((id) => ({ id, rec: catalog.find((r) => r.id === id) }))

  return (
    <aside className="node-meta-panel is-swap" aria-label={`${label} details`}>
      <h3>{rec?.title || label}</h3>
      <p>{rec?.summary.long || 'No metadata long summary on this node yet.'}</p>
      <OpenOnIpad
        sourceType="node"
        sourceId={`node:${graphId}:${nodeId}`}
        title={rec?.title || label}
        pageId={rec?.pageId}
        paperIds={rec?.paperIds ?? rec?.citations}
        related={rec?.related}
        citations={rec?.citations}
        gist={rec?.summary.long || label}
        capture='[data-ipad-export="diagram"]'
      />
      {pages.length ? (
        <nav aria-label="Related pages">
          <h4>Pages</h4>
          <ul>
            {pages.map(({ id, rec: page }) => (
              <li key={id}>
                <Link to={hrefFor(id, page)}>{page?.title || id.replace('page:', '')}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {papers.length ? (
        <nav aria-label="Cited papers">
          <h4>Papers</h4>
          <ul>
            {papers.map(({ id, rec: paper }) => (
              <li key={id}>
                <Link to={hrefFor(id, paper)}>{paper?.title || id}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </aside>
  )
}

export function DiagramsBoard({
  compact = false,
  onlyPrefix,
}: {
  compact?: boolean
  onlyPrefix?: string
}) {
  const [graphs, setGraphs] = useState<DiagramGraph[]>([])
  const [active, setActive] = useState('')
  const [selected, setSelected] = useState('')
  const [catalog, setCatalog] = useState<MetaRecord[]>([])
  const [figures, setFigures] = useState<PaperFigure[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [err, setErr] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (hash) setSelected(hash)
    void fetch(apiUrl('/api/diagrams'))
      .then((r) => r.json())
      .then((data: { loop?: DiagramGraph; graphs?: DiagramGraph[]; paperFigures?: PaperFigure[] }) => {
        const raw = data.graphs?.length ? data.graphs : data.loop ? [data.loop] : []
        const list = onlyPrefix ? raw.filter((g) => g.id.startsWith(onlyPrefix)) : raw
        setGraphs(list)
        setActive((cur) => cur || list[0]?.id || '')
        setFigures(data.paperFigures ?? [])
      })
      .catch(() => setErr('diagrams unavailable'))
    void fetch(apiUrl('/api/meta'))
      .then((r) => r.json())
      .then((data: { records?: MetaRecord[] }) => setCatalog(data.records ?? []))
      .catch(() => undefined)
  }, [onlyPrefix])

  const graph = graphs.find((g) => g.id === active) ?? graphs[0]
  const title = graph?.title || 'Loop diagram'
  const node = useMemo(() => graph?.nodes.find((n) => n.id === selected), [graph, selected])

  useEffect(() => {
    if (!selected) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
  }, [selected])

  const onMap = async (event: FormEvent) => {
    event.preventDefault()
    const query = q.trim()
    if (!query) return
    setStatus('mapping to code…')
    setErr('')
    const res = await fetch(apiUrl('/api/maps/fetch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, kind: 'diagram' }),
    })
    const data = (await res.json()) as { ok?: boolean; added?: unknown[]; error?: string }
    setStatus(res.ok && data.ok ? `mapped — ${data.added?.length ?? 0} new edges` : '')
    if (!res.ok || data.ok === false) setErr(data.error || 'map failed')
  }

  return (
    <section className="loop-board" aria-label="Diagrams and paper figures">
      <h2>{compact ? 'Hybrid RAG local-site loop' : title}</h2>
      {graph ? (
        <OpenOnIpad
          sourceType="diagram"
          sourceId={`diagram:${graph.id}`}
          title={title}
          gist={`${title}. Scribble on this diagram.`}
          capture='[data-ipad-export="diagram"]'
        />
      ) : null}
      {/* Caption travels with the diagram (`note` in its JSON), not with this component. */}
      <p className="rail-note">
        {graph?.note ||
          'GET /api/diagrams and GET /api/meta. On this loop, three dotted regions — iPad, local PC, website — and every node sits in one of them. Nodes stay small. Click a node for the full summary below. Forward edges are teal; feedback edges are orange. Animation is off until Animate flow.'}
      </p>
      {err ? (
        <p className="site-error" role="alert">
          {err}
        </p>
      ) : null}
      {graphs.length > 1 && !compact ? (
        <div className="graph-switch" role="tablist" aria-label="Diagrams">
          {graphs.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={g.id === graph?.id}
              className={g.id === graph?.id ? 'is-active' : undefined}
              onClick={() => {
                setActive(g.id)
                setSelected('')
              }}
            >
              {g.title}
            </button>
          ))}
        </div>
      ) : null}
      {graph ? (
        <GraphCanvas
          key={graph.id}
          nodes={graph.nodes}
          edges={graph.edges}
          title={title}
          compact={compact}
          selectedId={selected}
          onSelect={setSelected}
          regions={graph.regions ?? graph.blankets}
        />
      ) : null}
      <div ref={panelRef} className="node-meta-dock">
        {graph && node ? (
          <NodeMetaPanel
            key={node.id}
            graphId={graph.id}
            nodeId={node.id}
            label={node.label}
            catalog={catalog}
          />
        ) : (
          <p className="rail-note">Select a node for summaryLong, pages, and papers.</p>
        )}
      </div>
      {compact ? (
        <p className="rail-note">
          Full figures and the RSNN graph live on <Link to="/docs/diagrams">Diagrams</Link>.
        </p>
      ) : onlyPrefix ? (
        <p className="rail-note">
          Temporary graphs only. Full catalog on <Link to="/docs/diagrams">Diagrams</Link>.
        </p>
      ) : (
        <>
          <form className="fetch-form" onSubmit={(e) => void onMap(e)}>
            <label htmlFor="diag-q">Map a diagram label to code (required)</label>
            <input
              id="diag-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hybrid RAG, gist rail, loop diagram"
              autoCapitalize="none"
            />
            <button type="submit">Fetch code</button>
          </form>
          {status ? <p className="site-status">{status}</p> : null}
          <h3>Paper figure notes</h3>
          <ol className="paper-list">
            {figures.map((f, i) => (
              <li key={`${f.paperId}-${f.label}-${i}`}>
                <Link to={`/docs/papers#${f.paperId}`}>{f.paperId}</Link>
                <strong> {f.label}</strong>
                <p>{f.note}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
