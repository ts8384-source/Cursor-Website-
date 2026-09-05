import type { Editor, TLShape, TLShapeId } from 'tldraw'
import { isTinyTapStroke, shapesUnderStroke } from './scratch'

function pointInPolygon(x: number, y: number, poly: { x: number; y: number }[]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (crosses) inside = !inside
  }
  return inside
}

function pagePolygon(editor: Editor, stroke: TLShape) {
  const geometry = editor.getShapeGeometry(stroke)
  const transform = editor.getShapePageTransform(stroke)
  return geometry.vertices.map((vertex) => transform.applyToPoint(vertex))
}

function pathLength(points: { x: number; y: number }[]) {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return length
}

function looksClosed(points: { x: number; y: number }[]) {
  if (points.length < 8) return false
  const first = points[0]
  const last = points[points.length - 1]
  const gap = Math.hypot(last.x - first.x, last.y - first.y)
  const length = pathLength(points)
  return length > 40 && gap < Math.max(36, length * 0.35)
}

function shapesInsideLasso(editor: Editor, stroke: TLShape): TLShapeId[] {
  const polygon = pagePolygon(editor, stroke)
  if (!looksClosed(polygon)) return []

  const pageBounds = editor.getShapePageBounds(stroke)
  if (!pageBounds) return []

  const hits: TLShapeId[] = []
  for (const other of editor.getCurrentPageShapes()) {
    if (other.id === stroke.id) continue
    if (editor.isShapeOrAncestorLocked(other)) continue
    const otherBounds = editor.getShapePageBounds(other)
    if (!otherBounds || !pageBounds.collides(otherBounds)) continue
    const center = otherBounds.center
    if (pointInPolygon(center.x, center.y, polygon)) {
      hits.push(editor.getOutermostSelectableShape(other).id)
    }
  }
  return hits
}

/**
 * Pencil lasso: the finished stroke selects intersecting or enclosed marks, then goes away.
 * A tiny tap clears the selection (tap away).
 */
export function finishLassoStroke(editor: Editor, shape: TLShape): TLShapeId[] {
  if (shape.type !== 'draw' && shape.type !== 'highlight') return []

  if (isTinyTapStroke(editor, shape)) {
    editor.deleteShapes([shape.id])
    editor.setSelectedShapes([])
    return []
  }

  const hits = [...new Set([...shapesUnderStroke(editor, shape), ...shapesInsideLasso(editor, shape)])]
  editor.markHistoryStoppingPoint('lasso select')
  editor.deleteShapes([shape.id])
  editor.setSelectedShapes(hits)
  return hits
}

export function lassoMenuPoint(editor: Editor) {
  const bounds = editor.getSelectionScreenBounds()
  const pointer = editor.inputs.getCurrentScreenPoint()
  const hudClearance = 88
  // Two wrapping rows of 44px actions + padding — keep the menu on-screen.
  const menuH = 128
  const pad = 12
  const filesInset = 52

  let x = pointer.x
  let y = pointer.y + 28
  if (bounds) {
    x = bounds.x + bounds.w / 2
    const below = bounds.y + bounds.h + 14
    const above = bounds.y - menuH - 10
    y = below + menuH < window.innerHeight - pad ? below : Math.max(hudClearance, above)
  }

  const halfW = Math.min(170, Math.max(80, (window.innerWidth - filesInset - pad * 2) / 2))
  x = Math.min(Math.max(x, filesInset + pad + halfW), window.innerWidth - pad - halfW)
  y = Math.min(Math.max(y, hudClearance), window.innerHeight - pad - menuH)
  return { x, y }
}
