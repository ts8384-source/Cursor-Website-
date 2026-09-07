import type { TiedBoard } from '../site/types'

/** 44px HUD chip (handbook 9:1 / 13:1, bindings hit-target-44). Does not steal the ink surface. */
export function TiedBoardDock({ board }: { board: TiedBoard }) {
  const mode = board.surface === 'stamped' ? 'on picture' : 'clean'
  const title = board.title.length > 28 ? `${board.title.slice(0, 26)}…` : board.title
  return (
    <span className="tied-chip" title={`${board.title}. ${board.gist}`}>
      {board.sourceType} · {title} · {mode}
    </span>
  )
}
