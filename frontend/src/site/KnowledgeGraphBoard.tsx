import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { apiUrl } from '../api'
import { DirectedEdge, type DirectedEdgeData } from './DirectedEdge'
import type { MetaType } from './types'
import {
  KG_TYPES,
  bandForZoom,
  buildClusterIndex,
  isClusterId,
  viewEdges,
  zoomAfterCluster,
  type ScaleBand,
} from './kgClusters'

type GraphNode = {
  id: string
  type: MetaType
  title: string
  href?: string
  slug?: string
  summary: { short: string; long: string }
  tags: string[]
}

type GraphEdge = {
  id: string
  from: string
  to: string
  kind: string
}

type GraphPayload = {
  id: string
  title: string
  rule: string
  count: { nodes: number; edges: number }
  nodes: GraphNode[]
  edges: GraphEdge[]
  focus?: string | null
  missing?: boolean
}

const edgeTypes = { directed: DirectedEdge }

type KgData = {
  label: string
  kind: MetaType
  focused: boolean
  neighbor: boolean
  cluster: boolean
  count: number
}

function KgNode({ data }: { data: KgData }) {
  return (
    <div
      className={`kg-node t-${data.kind}${data.cluster ? ' is-cluster' : ''}${data.focused ? ' is-focus' : ''}${data.neighbor ? ' is-near' : ''}`}
    >
      <Handle type="target" position={Position.Top} />
      <span className="kg-kind">{data.cluster ? `cluster · ${data.kind}` : data.kind}</span>
      <span className="kg-label">{data.label}</span>
      {data.cluster ? <span className="kg-sub">{data.count} records — zoom in</span> : null}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = { kg: KgNode }

function FitFocus({ focus }: { focus: string }) {
  const rf = useReactFlow()
  useEffect(() => {
    if (!focus || isClusterId(focus)) return
    const node = rf.getNode(focus)
    if (node) {
      rf.setCenter(node.position.x + 90, node.position.y + 28, { zoom: 1.05, duration: 280 })
    }
  }, [focus, rf])
  return null
}

function hrefFor(n: GraphNode) {
  if (n.href) return n.href
  if (n.type === 'page' && n.slug) return `/site/${n.slug}`
  if (n.id.startsWith('page:')) return `/site/${n.id.slice(5)}`
  if (n.id.startsWith('module:')) return `/site/${n.id.slice(7)}`
  if (n.type === 'paper') return `/docs/papers#${n.id}`
  return '/docs/diagrams'
}

function bandCopy(band: ScaleBand) {
  if (band === 'type') return 'Highest scale — few type clusters. Scroll or + to open local groups inside them.'
  if (band === 'local') return 'Local clusters inside each type (hub neighborhoods on existing edges). Zoom in for records.'
  return 'Leaf scale — individual meta records. Zoom out to collapse into clusters.'
}

function KnowledgeGraphStage({
  graph,
  visible,
  focus,
  near,
  band,
  onBand,
  onSelect,
}: {
  graph: GraphPayload
  visible: GraphNode[]
  focus: string
  near: Set<string>
  band: ScaleBand
  onBand: (band: ScaleBand, zoom: number) => void
  onSelect: (id: string) => void
}) {
  const rf = useReactFlow()
  const keep = useMemo(() => new Set(visible.map((n) => n.id)), [visible])
  const index = useMemo(() => buildClusterIndex(visible, graph.edges), [visible, graph.edges])

  const flow = useMemo(() => {
    const placed: Node<KgData>[] = []
    if (band === 'type') {
      for (const c of index.typeClusters) {
        const pos = index.positions.get(c.id) ?? { x: 0, y: 0 }
        placed.push({
          id: c.id,
          type: 'kg',
          position: pos,
          data: {
            label: c.label,
            kind: c.kind,
            focused: Boolean(focus) && c.memberIds.includes(focus),
            neighbor: Boolean(focus) && c.memberIds.some((id) => near.has(id)),
            cluster: true,
            count: c.memberIds.length,
          },
        })
      }
    } else if (band === 'local') {
      for (const c of index.localClusters) {
        const pos = index.positions.get(c.id) ?? { x: 0, y: 0 }
        placed.push({
          id: c.id,
          type: 'kg',
          position: pos,
          data: {
            label: c.label,
            kind: c.kind,
            focused: Boolean(focus) && c.memberIds.includes(focus),
            neighbor: Boolean(focus) && c.memberIds.some((id) => near.has(id)),
            cluster: true,
            count: c.memberIds.length,
          },
        })
      }
    } else {
      for (const n of visible) {
        const pos = index.positions.get(n.id) ?? { x: 0, y: 0 }
        placed.push({
          id: n.id,
          type: 'kg',
          position: pos,
          selected: n.id === focus,
          data: {
            label: n.title,
            kind: n.type,
            focused: n.id === focus,
            neighbor: Boolean(focus) && near.has(n.id) && n.id !== focus,
            cluster: false,
            count: 1,
          },
        })
      }
    }

    const edges: Edge<DirectedEdgeData>[] = viewEdges(graph.edges, band, index, keep).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'directed',
      label: e.count > 1 ? `${e.label} ×${e.count}` : e.label,
      data: { route: 'straight' as const, flow: 'forward' as const },
    }))
    return { nodes: placed, edges }
  }, [band, graph.edges, index, keep, visible, focus, near])

  return (
    <ReactFlow
      nodes={flow.nodes}
      edges={flow.edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      minZoom={0.18}
      maxZoom={1.7}
      defaultViewport={{ x: 24, y: 20, zoom: 0.32 }}
      nodesConnectable={false}
      fitView={false}
      onMoveEnd={(_, viewport) => onBand(bandForZoom(viewport.zoom), viewport.zoom)}
      onNodeClick={(_, node) => {
        if (isClusterId(node.id)) {
          rf.setCenter(node.position.x + 90, node.position.y + 40, {
            zoom: zoomAfterCluster(band),
            duration: 280,
          })
          return
        }
        onSelect(node.id)
      }}
      onPaneClick={() => onSelect('')}
      proOptions={{ hideAttribution: true }}
    >
      <FitFocus focus={focus} />
      <Background gap={22} color="#d4cfc4" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable ariaLabel="Graph overview" />
    </ReactFlow>
  )
}

export function KnowledgeGraphBoard() {
  const location = useLocation()
  const [graph, setGraph] = useState<GraphPayload | null>(null)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<MetaType | 'all'>('all')
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState('')
  const [band, setBand] = useState<ScaleBand>('type')
  const [zoom, setZoom] = useState(0.32)

  const load = useCallback(() => {
    setErr('')
    void fetch(apiUrl('/api/graph'))
      .then(async (r) => {
        if (!r.ok) throw new Error('graph unavailable')
        return r.json() as Promise<GraphPayload>
      })
      .then((data) => setGraph(data))
      .catch(() => {
        setGraph(null)
        setErr('Knowledge graph could not be loaded. GET /api/graph.')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ''))
    if (hash) setFocus(hash)
  }, [location.hash])

  useEffect(() => {
    if (focus && !isClusterId(focus)) {
      setBand('leaf')
      setZoom(1.05)
    }
  }, [focus])

  const near = useMemo(() => {
    const ids = new Set<string>()
    if (!graph || !focus) return ids
    for (const e of graph.edges) {
      if (e.from === focus) ids.add(e.to)
      if (e.to === focus) ids.add(e.from)
    }
    ids.add(focus)
    return ids
  }, [graph, focus])

  const visible = useMemo(() => {
    if (!graph) return []
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
    return graph.nodes.filter((n) => {
      if (filter !== 'all' && n.type !== filter) return false
      if (!tokens.length) return true
      const hay = `${n.id} ${n.title} ${n.tags.join(' ')}`.toLowerCase()
      return tokens.every((t) => hay.includes(t))
    })
  }, [graph, filter, q])

  const selected = graph?.nodes.find((n) => n.id === focus)
  const indexPreview = useMemo(
    () => (graph ? buildClusterIndex(visible, graph.edges) : null),
    [graph, visible],
  )
  const shown =
    band === 'type'
      ? indexPreview?.typeClusters.length ?? 0
      : band === 'local'
        ? indexPreview?.localClusters.length ?? 0
        : visible.length

  const onSelect = (id: string) => {
    setFocus(id)
    const url = `${window.location.pathname}${id ? `#${encodeURIComponent(id)}` : ''}`
    window.history.replaceState(null, '', url)
  }

  const onBand = useCallback((next: ScaleBand, z: number) => {
    setBand(next)
    setZoom(z)
  }, [])

  if (err) {
    return (
      <div className="kg-board" role="alert">
        <p className="site-error">{err}</p>
        <button type="button" className="open-ipad-btn" onClick={load}>
          Retry graph
        </button>
      </div>
    )
  }
  if (!graph) {
    return <p className="rail-note">Loading the wiki knowledge graph…</p>
  }
  if (!graph.nodes.length) {
    return <p className="rail-note">No meta records on the graph yet. Pages and papers appear here after they have ids.</p>
  }

  return (
    <section className="kg-board" aria-labelledby="kg-heading">
      <header className="kg-toolbar">
        <h2 id="kg-heading">
          {graph.title}{' '}
          <span className="kg-count">
            {graph.count.nodes} nodes · {graph.count.edges} edges
          </span>
        </h2>
        <p className="kg-rule">{graph.rule}</p>
        <p className="kg-scale" aria-live="polite">
          Scale {band} · zoom {zoom.toFixed(2)} · {shown} on canvas.{' '}
          {bandCopy(band)} Clusters are a view — not new edges.
        </p>
        <form
          className="kg-find"
          onSubmit={(e) => {
            e.preventDefault()
            const hit = visible[0]
            if (hit) onSelect(hit.id)
          }}
        >
          <label htmlFor="kg-q">Find a node</label>
          <input
            id="kg-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="page, paper, or title"
          />
          <button type="submit">Focus first match</button>
        </form>
        <fieldset className="kg-filters">
          <legend>Show types</legend>
          <label>
            <input type="radio" name="kg-type" checked={filter === 'all'} onChange={() => setFilter('all')} />
            All
          </label>
          {KG_TYPES.map((t) => (
            <label key={t}>
              <input type="radio" name="kg-type" checked={filter === t} onChange={() => setFilter(t)} />
              {t}
            </label>
          ))}
        </fieldset>
      </header>
      {!visible.length ? (
        <p className="rail-note">No nodes match this filter. Clear the search or choose All.</p>
      ) : (
        <div className="kg-stage" role="img" aria-label="Wiki knowledge graph with scale-variant clusters">
          <ReactFlowProvider>
            <KnowledgeGraphStage
              graph={graph}
              visible={visible}
              focus={focus}
              near={near}
              band={band}
              onBand={onBand}
              onSelect={onSelect}
            />
          </ReactFlowProvider>
        </div>
      )}
      {selected ? (
        <aside className="node-meta-panel is-swap" aria-label={`${selected.title} on the wiki graph`}>
          <h3>{selected.title}</h3>
          <p className="kg-id">{selected.id}</p>
          <p>{selected.summary.long}</p>
          <p>
            <Link to={hrefFor(selected)}>Open the real {selected.type}</Link>
            {' · '}
            <button type="button" className="gist-toggle" onClick={() => onSelect('')}>
              Clear focus
            </button>
          </p>
        </aside>
      ) : (
        <p className="rail-note">
          Zoomed out you see type clusters. Zoom or click a cluster for local groups, then records. Click a record to
          focus it. Pages use Show on knowledge graph to jump here.
        </p>
      )}
    </section>
  )
}

export function JumpToGraph({ id, label }: { id: string; label?: string }) {
  if (!id) return null
  return (
    <p className="jump-graph">
      <Link className="open-ipad-btn" to={`/docs/knowledge-graph#${encodeURIComponent(id)}`}>
        {label || 'Show on knowledge graph'}
      </Link>
    </p>
  )
}
