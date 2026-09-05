import type { Editor, TLShape, TLShapeId } from 'tldraw'

function strokeMetrics(editor: Editor, shape: TLShape) {
  const geometry = editor.getShapeGeometry(shape)
  const vertices = geometry.vertices
  const { bounds } = geometry
  const diag = Math.hypot(bounds.w, bounds.h)
  let length = 0
  let reversals = 0
  let lastDx = 0
  let lastDy = 0
  for (let i = 1; i < vertices.length; i++) {
    const dx = vertices[i].x - vertices[i - 1].x
    const dy = vertices[i].y - vertices[i - 1].y
    length += Math.hypot(dx, dy)
    if (lastDx * dx < 0) reversals += 1
    if (lastDy * dy < 0) reversals += 1
    if (dx !== 0) lastDx = dx
    if (dy !== 0) lastDy = dy
  }
  return { vertices, bounds, diag, length, reversals }
}

function strokeLooksLikeScratch(editor: Editor, shape: TLShape, minReversals: number) {
  const { vertices, bounds, diag, length, reversals } = strokeMetrics(editor, shape)
  if (vertices.length < 14 || diag < 8) return false
  // Tight back-and-forth over a small area. A single slash through a shape must not match.
  return reversals >= minReversals && length > diag * 2.4 && bounds.w < 420 && bounds.h < 280
}

export function shapesUnderStroke(editor: Editor, stroke: TLShape): TLShapeId[] {
  const pageBounds = editor.getShapePageBounds(stroke)
  if (!pageBounds) return []

  const geometry = editor.getShapeGeometry(stroke)
  const strokeTransform = editor.getShapePageTransform(stroke)
  const vertices = geometry.vertices
  const margin = editor.options.hitTestMargin / editor.getZoomLevel()
  const hits: TLShapeId[] = []

  for (const other of editor.getCurrentPageShapes()) {
    if (other.id === stroke.id) continue
    if (editor.isShapeOrAncestorLocked(other)) continue
    const otherBounds = editor.getShapePageBounds(other)
    if (!otherBounds || !pageBounds.clone().expandBy(margin).collides(otherBounds)) continue

    const otherGeo = editor.getShapeGeometry(other)
    const toOther = editor.getShapePageTransform(other).clone().invert()
    let hit = false
    for (let i = 1; i < vertices.length; i++) {
      const a = toOther.applyToPoint(strokeTransform.applyToPoint(vertices[i - 1]))
      const b = toOther.applyToPoint(strokeTransform.applyToPoint(vertices[i]))
      if (otherGeo.hitTestLineSegment(a, b, margin + 6)) {
        hit = true
        break
      }
    }
    if (hit) hits.push(editor.getOutermostSelectableShape(other).id)
  }

  return hits
}

export function isTinyTapStroke(editor: Editor, shape: TLShape) {
  const { vertices, length, diag } = strokeMetrics(editor, shape)
  return vertices.length < 10 && length < 18 && diag < 16
}

/**
 * GoodNotes-style scratch-out: dense zigzags over ink delete that ink.
 * A single line through a shape is normal drawing and is left alone.
 */
export function finishInkStroke(
  editor: Editor,
  shape: TLShape,
  opts: { dedicatedScratch: boolean },
): 'erased' | 'discarded' | 'tap' | 'kept' {
  if (shape.type !== 'draw' && shape.type !== 'highlight') return 'kept'

  if (opts.dedicatedScratch && isTinyTapStroke(editor, shape)) {
    editor.deleteShapes([shape.id])
    return 'tap'
  }

  const minReversals = opts.dedicatedScratch ? 6 : 8
  if (strokeLooksLikeScratch(editor, shape, minReversals)) {
    const hits = shapesUnderStroke(editor, shape)
    if (hits.length > 0) {
      editor.markHistoryStoppingPoint('scribble erase')
      editor.deleteShapes([...new Set([...hits, shape.id])])
      return 'erased'
    }
  }

  if (opts.dedicatedScratch) {
    editor.deleteShapes([shape.id])
    return 'discarded'
  }

  return 'kept'
}
