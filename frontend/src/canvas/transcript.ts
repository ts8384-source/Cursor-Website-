import type { Editor, TLShape } from 'tldraw'
import type { ParkBoardMeta } from '../site/types'

function plainText(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(plainText).filter(Boolean).join('')
  if (typeof node === 'object') {
    const value = node as Record<string, unknown>
    if (typeof value.text === 'string') return value.text
    if ('content' in value) return plainText(value.content)
    if ('richText' in value) return plainText(value.richText)
  }
  return ''
}

function shapeLine(shape: TLShape) {
  const props = shape.props as Record<string, unknown>
  const label = plainText(props.richText) || (typeof props.text === 'string' ? props.text : '')
  const kind = typeof props.geo === 'string' ? `${shape.type}:${props.geo}` : shape.type
  const at = `(${Math.round(shape.x)}, ${Math.round(shape.y)})`
  return label ? `- ${kind} ${at}: ${label}` : `- ${kind} ${at}`
}

export function canvasTranscript(editor: Editor, meta?: ParkBoardMeta) {
  const shapes = editor.getCurrentPageShapes()
  const ink = shapes.filter((shape) => shape.type === 'draw' || shape.type === 'highlight').length
  const lines = shapes.map(shapeLine)
  const tie = meta?.boardId
    ? [
        `## Tied board`,
        ``,
        `- boardId: ${meta.boardId}`,
        `- sourceType: ${meta.sourceType ?? ''}`,
        `- sourceId: ${meta.sourceId ?? ''}`,
        `- pageId: ${meta.pageId ?? ''}`,
        `- paperIds: ${(meta.paperIds ?? []).join(', ')}`,
        `- sourceSlug: ${meta.sourceSlug ?? ''}`,
        `- boardKey: ${meta.boardKey ?? ''}`,
        `- surface: ${meta.surface ?? ''}`,
        `- assetPath: ${meta.assetPath ?? ''}`,
        ``,
      ]
    : []
  return [
    `# iPad canvas`,
    ``,
    `${shapes.length} shapes, ${ink} freehand strokes.`,
    ``,
    ...tie,
    ...lines,
    ``,
  ].join('\n')
}
