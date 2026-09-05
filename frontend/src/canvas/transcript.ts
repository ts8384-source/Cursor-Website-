import type { Editor, TLShape } from 'tldraw'

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

export function canvasTranscript(editor: Editor) {
  const shapes = editor.getCurrentPageShapes()
  const ink = shapes.filter((shape) => shape.type === 'draw' || shape.type === 'highlight').length
  const lines = shapes.map(shapeLine)
  return [
    `# iPad canvas`,
    ``,
    `${shapes.length} shapes, ${ink} freehand strokes.`,
    ``,
    ...lines,
    ``,
  ].join('\n')
}
