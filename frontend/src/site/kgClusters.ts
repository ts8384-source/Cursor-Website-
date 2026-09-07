import type { MetaType } from './types'

export const KG_TYPES: MetaType[] = ['page', 'paper', 'module', 'diagram', 'node', 'code']

export type ScaleBand = 'type' | 'local' | 'leaf'

export type ClusterMember = {
  id: string
  type: MetaType
  title: string
  tags: string[]
}

export type ClusterLink = {
  id: string
  from: string
  to: string
  kind: string
}

export type ClusterRec = {
  id: string
  band: Exclude<ScaleBand, 'leaf'>
  label: string
  kind: MetaType
  memberIds: string[]
  parentId: string | null
}

export type ClusterIndex = {
  typeClusters: ClusterRec[]
  localClusters: ClusterRec[]
  memberToType: Map<string, string>
  memberToLocal: Map<string, string>
  positions: Map<string, { x: number; y: number }>
}

const LOCAL_CAP = 10

export function bandForZoom(zoom: number): ScaleBand {
  if (!Number.isFinite(zoom) || zoom < 0.45) return 'type'
  if (zoom < 0.88) return 'local'
  return 'leaf'
}

export function isClusterId(id: string) {
  return id.startsWith('cluster:')
}

function inducedAdj(ids: Set<string>, links: ClusterLink[]) {
  const adj = new Map<string, Set<string>>()
  for (const id of ids) adj.set(id, new Set())
  for (const e of links) {
    if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to) continue
    adj.get(e.from)!.add(e.to)
    adj.get(e.to)!.add(e.from)
  }
  return adj
}

/** Size-capped BFS around hubs on the type-induced subgraph. Isolates share one unlinked cluster. View only. */
export function localClustersForType(type: MetaType, ids: string[], links: ClusterLink[]): ClusterRec[] {
  const remaining = new Set(ids)
  const adj = inducedAdj(remaining, links)
  const degreeIn = (id: string) => [...(adj.get(id) ?? [])].filter((n) => remaining.has(n)).length
  const out: ClusterRec[] = []
  const isolates: string[] = []
  const typeClusterId = `cluster:type:${type}`

  while (remaining.size) {
    let hub = ''
    let best = -1
    for (const id of remaining) {
      const d = degreeIn(id)
      if (d > best || (d === best && id < hub)) {
        hub = id
        best = d
      }
    }
    if (best <= 0) {
      isolates.push(...remaining)
      break
    }
    const members: string[] = []
    const queue = [hub]
    remaining.delete(hub)
    members.push(hub)
    while (queue.length && members.length < LOCAL_CAP) {
      const v = queue.shift()!
      for (const n of adj.get(v) ?? []) {
        if (!remaining.has(n) || members.length >= LOCAL_CAP) continue
        remaining.delete(n)
        members.push(n)
        queue.push(n)
      }
    }
    const idx = out.length
    out.push({
      id: `cluster:local:${type}:${idx}`,
      band: 'local',
      label: `${type} cluster ${idx + 1}`,
      kind: type,
      memberIds: members,
      parentId: typeClusterId,
    })
  }

  if (isolates.length) {
    out.push({
      id: `cluster:local:${type}:unlinked`,
      band: 'local',
      label: `Unlinked ${type}s`,
      kind: type,
      memberIds: isolates,
      parentId: typeClusterId,
    })
  }
  return out
}

export function buildClusterIndex(nodes: ClusterMember[], links: ClusterLink[]): ClusterIndex {
  const typeClusters: ClusterRec[] = []
  const localClusters: ClusterRec[] = []
  const memberToType = new Map<string, string>()
  const memberToLocal = new Map<string, string>()
  const positions = new Map<string, { x: number; y: number }>()

  for (const type of KG_TYPES) {
    const members = nodes.filter((n) => n.type === type)
    if (!members.length) continue
    const typeId = `cluster:type:${type}`
    typeClusters.push({
      id: typeId,
      band: 'type',
      label: type === 'node' ? 'Diagram nodes' : `${type[0].toUpperCase()}${type.slice(1)}s`,
      kind: type,
      memberIds: members.map((m) => m.id),
      parentId: null,
    })
    for (const m of members) memberToType.set(m.id, typeId)

    const locals = localClustersForType(
      type,
      members.map((m) => m.id),
      links,
    )
    for (const loc of locals) {
      localClusters.push(loc)
      for (const id of loc.memberIds) memberToLocal.set(id, loc.id)
    }
  }

  const typeW = 340
  const localW = 210
  const nodeW = 196
  const localH = 150
  const nodeH = 80

  for (const [tIdx, type] of KG_TYPES.entries()) {
    const locals = localClusters.filter((c) => c.kind === type)
    const cols = Math.max(1, Math.min(3, locals.length))
    locals.forEach((loc, i) => {
      const lx = 32 + tIdx * typeW + (i % cols) * localW
      const ly = 36 + Math.floor(i / cols) * localH
      positions.set(loc.id, { x: lx, y: ly })
      loc.memberIds.forEach((id, j) => {
        positions.set(id, {
          x: lx + (j % 2) * (nodeW * 0.15),
          y: ly + Math.floor(j / 2) * nodeH,
        })
      })
    })
    const typeCluster = typeClusters.find((c) => c.kind === type)
    if (typeCluster) {
      const pts = locals.map((c) => positions.get(c.id)).filter(Boolean) as { x: number; y: number }[]
      const cx = pts.length ? pts.reduce((s, p) => s + p.x, 0) / pts.length : 32 + tIdx * typeW
      const cy = pts.length ? pts.reduce((s, p) => s + p.y, 0) / pts.length : 36
      positions.set(typeCluster.id, { x: cx, y: cy })
    }
  }

  return { typeClusters, localClusters, memberToType, memberToLocal, positions }
}

export function clusterOf(id: string, band: ScaleBand, index: ClusterIndex): string {
  if (band === 'leaf') return id
  if (band === 'local') return index.memberToLocal.get(id) ?? index.memberToType.get(id) ?? id
  return index.memberToType.get(id) ?? id
}

export type ViewEdge = { id: string; source: string; target: string; label: string; count: number }

/** Aggregate existing edges between the visible supernodes. Does not invent links. */
export function viewEdges(links: ClusterLink[], band: ScaleBand, index: ClusterIndex, keep: Set<string>): ViewEdge[] {
  const bag = new Map<string, ViewEdge>()
  for (const e of links) {
    if (!keep.has(e.from) || !keep.has(e.to)) continue
    const source = clusterOf(e.from, band, index)
    const target = clusterOf(e.to, band, index)
    if (source === target) continue
    const id = `${e.kind}:${source}->${target}`
    const prev = bag.get(id)
    if (prev) {
      prev.count += 1
      continue
    }
    bag.set(id, { id, source, target, label: e.kind, count: 1 })
  }
  return [...bag.values()]
}

export function zoomAfterCluster(band: ScaleBand): number {
  if (band === 'type') return 0.62
  if (band === 'local') return 1.05
  return 1.2
}
