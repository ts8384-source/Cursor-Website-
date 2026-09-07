import { createContext, useContext, useMemo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  type Edge,
  type EdgeProps,
  type Position,
} from '@xyflow/react'

/** Forward vs feedback stay distinct; flash is a lighter mix of the same hue. */
export const FORWARD_INK = '#0aa2c2'
export const FEEDBACK_INK = '#e85d04'
/** @deprecated use FORWARD_INK — kept so old greps still find a neon token. */
export const INK_NEON = FORWARD_INK
const CHEVRON_STEP = 72
const END_PAD = 44
const CHEVRON_LEN = 4
const CHEVRON_HALF = 2.2
const STROKE = 1.05

export const EdgeFlowAnimateContext = createContext(false)

export function flashFromBase(hex: string): string {
  const n = hex.replace('#', '')
  if (n.length !== 6) return hex
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.42))
  const r = mix(parseInt(n.slice(0, 2), 16))
  const g = mix(parseInt(n.slice(2, 4), 16))
  const b = mix(parseInt(n.slice(4, 6), 16))
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

type Route = 'straight' | 'step'
export type EdgeFlow = 'forward' | 'feedback'

export type DirectedEdgeData = {
  route?: Route
  flow?: EdgeFlow
}

const FEEDBACK_KINDS = new Set([
  'feedback',
  'stop-grad',
  'stopgrad',
  'backward',
  'back',
  'loop',
  'reverse',
])
const FEEDBACK_DIRS = new Set(['backward', 'back', 'feedback', 'reverse', 'reversed', 'loop'])

/** Honor kind / direction / reversed / loop labels. Do not infer from rank or geometry. */
export function isFeedbackEdge(e: {
  kind?: string
  direction?: string
  reversed?: boolean
  label?: string
}): boolean {
  const kind = (e.kind ?? '').toLowerCase().trim()
  if (FEEDBACK_KINDS.has(kind)) return true
  const dir = (e.direction ?? '').toLowerCase().trim()
  if (FEEDBACK_DIRS.has(dir)) return true
  if (e.reversed === true) return true
  const label = (e.label ?? '').toLowerCase()
  if (!label) return false
  return /\b(loop|feedback|backward|reverse(?:d)?)\b/.test(label) || /\bback\b/.test(label)
}

function edgePath(
  route: Route,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: Position,
  targetPosition: Position,
): [string, number, number] {
  if (route === 'step') {
    return getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 8,
    })
  }
  return getStraightPath({ sourceX, sourceY, targetX, targetY })
}

function sampleChevrons(d: string): { x: number; y: number; ang: number }[] {
  if (typeof document === 'undefined') return []
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('d', d)
  const total = el.getTotalLength()
  if (!Number.isFinite(total) || total < 8) return []

  const chevrons: { x: number; y: number; ang: number }[] = []
  const usable = total - END_PAD * 2
  if (usable >= CHEVRON_STEP * 0.45) {
    const start = END_PAD
    const end = total - END_PAD
    for (let t = start; t <= end + 0.01; t += CHEVRON_STEP) {
      const p = el.getPointAtLength(t)
      const q = el.getPointAtLength(Math.min(total, t + 3))
      chevrons.push({ x: p.x, y: p.y, ang: Math.atan2(q.y - p.y, q.x - p.x) })
    }
  } else if (total > 28) {
    const t = total * 0.5
    const p = el.getPointAtLength(t)
    const q = el.getPointAtLength(Math.min(total, t + 3))
    chevrons.push({ x: p.x, y: p.y, ang: Math.atan2(q.y - p.y, q.x - p.x) })
  }
  return chevrons
}

function chevronD(x: number, y: number, ang: number): string {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const bx = x - c * CHEVRON_LEN
  const by = y - s * CHEVRON_LEN
  const px = -s * CHEVRON_HALF
  const py = c * CHEVRON_HALF
  return `M ${bx + px} ${by + py} L ${x} ${y} L ${bx - px} ${by - py}`
}

export function DirectedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
}: EdgeProps<Edge<DirectedEdgeData>>) {
  const route: Route = data?.route === 'step' ? 'step' : 'straight'
  const [d, labelX, labelY] = edgePath(
    route,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  )
  const chevrons = useMemo(() => sampleChevrons(d), [d])
  const animate = useContext(EdgeFlowAnimateContext)
  const base = data?.flow === 'feedback' ? FEEDBACK_INK : FORWARD_INK
  const flash = flashFromBase(base)

  return (
    <>
      <BaseEdge
        id={id}
        path={d}
        style={{ stroke: 'transparent', strokeWidth: 14, fill: 'none' }}
      />
      <path
        d={d}
        fill="none"
        className="rf-edge-stroke"
        style={{
          stroke: base,
          strokeWidth: STROKE,
        }}
      />
      {animate ? (
        <path
          d={d}
          fill="none"
          className="rf-edge-flowdash is-on"
          style={{ stroke: flash }}
        />
      ) : null}
      {chevrons.map((ch, i) => (
        <path
          key={`${id}-ch-${i}`}
          d={chevronD(ch.x, ch.y, ch.ang)}
          className="rf-edge-chevron"
          style={{ stroke: base }}
        />
      ))}
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="rf-edge-midlabel"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
