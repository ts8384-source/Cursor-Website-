export type StampGuardBoard = {
  id: string
  surface: string
  boardKey: string
  persistenceKey: string
}

export type StampPayload = {
  boardId: string
  activeBoardId: string
  persistenceKey?: string
}

/** Refuse unless this editor is the board the stamp was sent to. */
export function canStampBoard(payload: StampPayload, board: StampGuardBoard) {
  if (!payload.boardId || payload.activeBoardId !== payload.boardId) return false
  if (payload.boardId !== board.id) return false
  if (board.surface !== 'stamped') return false
  if (payload.persistenceKey && payload.persistenceKey !== board.persistenceKey && payload.persistenceKey !== board.boardKey) {
    return false
  }
  return true
}
