import { useEffect, useMemo, useState } from 'react'
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
import {
  DirectedEdge,
  EdgeFlowAnimateContext,
  isFeedbackEdge,
  type DirectedEdgeData,
} from './DirectedEdge'
import type { DiagramEdge, DiagramNode, DiagramRegion } from './types'

type LoopData = { label: string; group: string; blurb?: string; selected?: boolean }
type RegionData = { label: string; source?: 'user' | 'inferred' }

const RANK: Record<string, number> = {
  in: 0,
  data: 0,
  core: 1,
  model: 1,
  store: 2,
  site: 3,
  loss: 3,
  agent: 4,
  'stop-grad': 4,
}

const edgeTypes = { directed: DirectedEdge }

function LoopNode({ data }: { data: LoopData }) {
  return (
    <div className={`rf-loop-node g-${data.group}${data.selected ? ' is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <span className="rf-loop-label">{data.label}</span>
      {data.selected && data.blurb ? <span className="rf-loop-detail">{data.blurb}</span> : null}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

function RegionNode({ data }: { data: RegionData }) {
  return (
    <div className="rf-region" data-source={data.source}>
      <span className="rf-region-label">{data.label}</span>
    </div>
  )
}

const nodeTypes = { loop: LoopNode, region: RegionNode }

const FIT = { padding: 0.18, minZoom: 0.45, maxZoom: 1.25 } as const

function FitOnLoad() {
  const rf = useReactFlow()
  useEffect(() => {
    const fit = () => {
      rf.fitView(FIT)
    }
    fit()
    const t0 = window.setTimeout(fit, 0)
    const t1 = window.setTimeout(fit, 120)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
    }
  }, [rf])
  return null
}

function toFlow(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  selectedId?: string,
  regions: DiagramRegion[] = [],
): { nodes: Node[]; edges: Edge[] } {
  const xs = nodes.map((n) => n.x).filter((v): v is number => typeof v === 'number')
  const ys = nodes.map((n) => n.y).filter((v): v is number => typeof v === 'number')
  const maxX = xs.length ? Math.max(...xs) : 0
  const maxY = ys.length ? Math.max(...ys) : 0
  const percent = xs.length === nodes.length && maxX <= 100 && maxY <= 100
  const planeW = 1180
  const planeH = 640
  const nodeW = 176
  const nodeH = 52

  const placed: Node<LoopData>[] = nodes.map((n) => {
    let x = 40
    let y = 40
    if (percent && n.x != null && n.y != null) {
      x = (n.x / 100) * (planeW - nodeW)
      y = (n.y / 100) * (planeH - nodeH)
    } else if (!percent && n.x != null && n.y != null) {
      x = n.x
      y = n.y
    } else {
      const rank = RANK[n.group ?? 'core'] ?? 1
      const siblings = nodes.filter((o) => (RANK[o.group ?? 'core'] ?? 1) === rank)
      const idx = Math.max(0, siblings.findIndex((o) => o.id === n.id))
      x = rank * 240 + 24
      y = idx * 88 + 24
    }
    return {
      id: n.id,
      type: 'loop',
      position: { x, y },
      zIndex: 2,
      data: {
        label: n.label,
        group: n.group ?? 'core',
        blurb: n.meta?.summaryShort || n.detail,
        selected: n.id === selectedId,
      },
      selected: n.id === selectedId,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }
  })

  const byId = new Map(placed.map((n) => [n.id, n]))
  const pad = 22
  const labelBand = 20
  const overlays: Node<RegionData>[] = []

  for (const region of regions) {
    const members = region.nodeIds.map((id) => byId.get(id)).filter((n): n is Node<LoopData> => Boolean(n))
    if (!members.length) continue
    const minX = Math.min(...members.map((n) => n.position.x)) - pad
    const minY = Math.min(...members.map((n) => n.position.y)) - pad - labelBand
    const maxX2 = Math.max(...members.map((n) => n.position.x + nodeW)) + pad
    const maxY2 = Math.max(...members.map((n) => n.position.y + nodeH + (n.data.selected ? 22 : 0))) + pad
    overlays.push({
      id: `region:${region.id}`,
      type: 'region',
      position: { x: minX, y: minY },
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: 0,
      style: { width: Math.max(96, maxX2 - minX), height: Math.max(56, maxY2 - minY) },
      data: { label: region.label, source: region.source },
    })
  }
  overlays.sort((a, b) => {
    const aa = Number(a.style?.width ?? 0) * Number(a.style?.height ?? 0)
    const ba = Number(b.style?.width ?? 0) * Number(b.style?.height ?? 0)
    return ba - aa
  })

  const rfEdges: Edge<DirectedEdgeData>[] = edges.map((e, i) => {
    const feedback = isFeedbackEdge(e)
    const kind = (e.kind ?? '').toLowerCase()
    const step = feedback || kind === 'stop-grad'
    return {
      id: `${e.from}-${e.to}-${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      zIndex: 1,
      type: 'directed',
      data: {
        route: step ? 'step' : 'straight',
        flow: feedback ? 'feedback' : 'forward',
      },
    }
  })

  return { nodes: [...overlays, ...placed], edges: rfEdges }
}

function GraphInner({
  nodes,
  edges,
  title,
  compact,
  selectedId,
  onSelect,
  regions,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  title: string
  compact?: boolean
  selectedId?: string
  onSelect?: (id: string) => void
  regions?: DiagramRegion[]
}) {
  const flow = useMemo(() => toFlow(nodes, edges, selectedId, regions), [nodes, edges, selectedId, regions])
  const [animate, setAnimate] = useState(false)
  if (!nodes.length) {
    return <p className="rail-note">No nodes in this graph.</p>
  }
  const shell = ['graph-canvas', compact ? 'is-compact' : '', animate ? 'is-animating' : '']
    .filter(Boolean)
    .join(' ')
  return (
    <EdgeFlowAnimateContext.Provider value={animate}>
    <div className={shell}>
      <div className="graph-canvas-bar">
        <button
          type="button"
          className="graph-animate-btn"
          aria-pressed={animate}
          aria-label={animate ? 'Stop edge flow animation' : 'Animate edge flow'}
          onClick={() => setAnimate((on) => !on)}
        >
          {animate ? 'Stop' : 'Animate flow'}
        </button>
      </div>
      <div className="graph-canvas-stage" data-ipad-export="diagram" role="img" aria-label={title}>
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.3}
        maxZoom={1.75}
        nodesConnectable={false}
        elementsSelectable
        fitView
        fitViewOptions={FIT}
        onInit={(instance) => {
          instance.fitView(FIT)
        }}
        onNodeClick={(_, node) => {
          if (String(node.id).startsWith('region:') || String(node.id).startsWith('blanket:')) return
          onSelect?.(node.id)
        }}
        onPaneClick={() => onSelect?.('')}
        proOptions={{ hideAttribution: true }}
      >
        <FitOnLoad />
        <Background gap={20} color="#d4cfc4" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable ariaLabel="Diagram overview" />
      </ReactFlow>
      </div>
    </div>
    </EdgeFlowAnimateContext.Provider>
  )
}

export function GraphCanvas({
  nodes,
  edges,
  title,
  compact,
  selectedId,
  onSelect,
  regions,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  title: string
  compact?: boolean
  selectedId?: string
  onSelect?: (id: string) => void
  regions?: DiagramRegion[]
}) {
  return (
    <ReactFlowProvider>
      <GraphInner
        nodes={nodes}
        edges={edges}
        title={title}
        compact={compact}
        selectedId={selectedId}
        onSelect={onSelect}
        regions={regions}
      />
    </ReactFlowProvider>
  )
}
