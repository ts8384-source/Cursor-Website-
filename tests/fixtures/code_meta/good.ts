// @chunk
// id: code:demo.fuse
// type: function
// implements: page:hybrid-rag
// tags: [rrf]
// summary: Fuse two rankings
// @end
export function fuse(a: string[], b: string[]): string[] {
  return [...a, ...b]
}

/* @chunk
 * id: code:demo.note
 * type: const
 * summary: Tiny helper
 * @end
 */
export const note = "ok"

// @chunk id=code:demo.tiny type=function
export function tiny(): number {
  return 2
}
