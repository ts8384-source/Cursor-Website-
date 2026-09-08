import { useEffect, useId } from 'react'
import { JSXGraph } from 'jsxgraph'
import '../../../node_modules/jsxgraph/distrib/jsxgraph.css'

type Props = {
  /** Optional fixed DOM id; otherwise a stable React id is used. */
  boardId?: string
  height?: number
  /** γ^t decay demo — handy for SR / discount prototyping. */
  mode?: 'gamma-decay'
  className?: string
}

/**
 * Small JSXGraph board for sandbox prototypes.
 * Framework math text uses KaTeX; use this for interactive plots, not TeX.
 */
export function JsxGraphPlot({ boardId, height = 220, mode = 'gamma-decay', className }: Props) {
  const autoId = `jxg-proto-${useId().replace(/:/g, '')}`
  const id = boardId || autoId

  useEffect(() => {
    if (mode !== 'gamma-decay') return
    const board = JSXGraph.initBoard(id, {
      boundingbox: [-0.2, 1.15, 12.5, -0.15],
      axis: true,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: false },
    })
    const gamma = board.create(
      'slider',
      [
        [0.5, 1.0],
        [4.5, 1.0],
        [0.5, 0.9, 0.99],
      ],
      { name: 'γ', snapWidth: 0.01, precision: 2 },
    ) as unknown as { Value: () => number }

    board.create(
      'functiongraph',
      [(t: number) => Math.pow(Number(gamma.Value()), t), 0, 12],
      { strokeColor: '#0b3d8c', strokeWidth: 2 },
    )
    board.create(
      'text',
      [6.2, 0.85, () => `γ^t with γ=${Number(gamma.Value()).toFixed(2)}`],
      { fontSize: 14 },
    )
    return () => {
      JSXGraph.freeBoard(board)
    }
  }, [id, mode])

  return (
    <div className={className}>
      <div
        id={id}
        className="jsxgraph-plot"
        style={{ width: '100%', height }}
        role="img"
        aria-label="Interactive JSXGraph plot"
      />
    </div>
  )
}
