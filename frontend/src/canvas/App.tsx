import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Tldraw, type Editor, type TLShape } from 'tldraw'
import 'tldraw/tldraw.css'
import { apiUrl } from '../api'
import type { ParkBoardMeta, TiedBoard } from '../site/types'
import { FilesExplorer } from './FilesExplorer'
import { parkSnapshot } from './inbox'
import { finishLassoStroke, lassoMenuPoint } from './lasso'
import { PairingCard } from './PairingCard'
import { finishInkStroke } from './scratch'
import { stampBoardImages } from './stampBoard'
import { TiedBoardDock } from './TiedBoardDock'
import {
  FIRST_BOARD_ID,
  FIRST_BOARD_KEY,
  findFile,
  firstFile,
  loadActiveId,
  loadWorkspace,
  persistActiveId,
  persistWorkspace,
  pruneOtherTiedBoards,
  upsertTiedBoard,
} from './workspace'

const TIED_SEEN = 'ipad-tied-seen'
const PENDING_FRESH_MS = 5 * 60 * 1000

type InkTool = 'draw' | 'lasso' | 'scratch'

type LassoMenu = {
  x: number
  y: number
  count: number
}

function applyDrawMode(editor: Editor) {
  editor.inputs.setAltKey(false)
  editor.setCurrentTool('draw')
  editor.updateInstanceState({
    isToolLocked: true,
    isPenMode: true,
  })
}

function applyLassoMode(editor: Editor) {
  // Lasso is a Pencil tool: draw a scribble/loop, then select — not tldraw's Alt+select.
  editor.inputs.setAltKey(false)
  editor.setCurrentTool('draw')
  editor.updateInstanceState({
    isToolLocked: true,
    isPenMode: true,
  })
}

function applyScratchMode(editor: Editor) {
  // Same Pencil draw tool — we only treat finished zigzags as erase (not tldraw eraser).
  editor.inputs.setAltKey(false)
  editor.setCurrentTool('draw')
  editor.updateInstanceState({
    isToolLocked: true,
    isPenMode: true,
  })
}

export function App() {
  const editorRef = useRef<Editor | null>(null)
  const lassoRef = useRef(false)
  const scratchRef = useRef(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [inkTool, setInkTool] = useState<InkTool>('draw')
  const [lassoMenu, setLassoMenu] = useState<LassoMenu | null>(null)
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [activeId, setActiveId] = useState(loadActiveId)
  const [tied, setTied] = useState<TiedBoard | null>(null)
  const applyingRef = useRef<string | null>(null)
  const appliedPendingRef = useRef<string | null>(null)
  const stampRef = useRef<TiedBoard | null>(null)
  const editorBoardIdRef = useRef<string | null>(null)

  const activeFile = findFile(workspace, activeId) ?? firstFile(workspace)
  const canvasKey = activeFile?.persistenceKey ?? FIRST_BOARD_KEY
  const activeBoardId = activeFile?.id ?? FIRST_BOARD_ID
  const activeBoardIdRef = useRef(activeBoardId)
  const canvasKeyRef = useRef(canvasKey)
  activeBoardIdRef.current = activeBoardId
  canvasKeyRef.current = canvasKey
  const parkMeta: ParkBoardMeta | undefined = useMemo(
    () =>
      tied && activeFile?.id === tied.id
        ? {
            boardId: tied.id,
            pageId: tied.pageId,
            paperIds: tied.paperIds,
            sourceType: tied.sourceType,
            sourceId: tied.sourceId,
            sourceSlug: tied.sourceSlug,
            boardKey: tied.boardKey,
            surface: tied.surface,
            assetPath: tied.assetPath,
          }
        : undefined,
    [tied, activeFile?.id],
  )

  const goDraw = useCallback((editor: Editor) => {
    lassoRef.current = false
    scratchRef.current = false
    applyDrawMode(editor)
    setInkTool('draw')
    setLassoMenu(null)
  }, [])

  const goLasso = useCallback((editor: Editor) => {
    lassoRef.current = true
    scratchRef.current = false
    applyLassoMode(editor)
    setInkTool('lasso')
  }, [])

  const goScratch = useCallback((editor: Editor) => {
    lassoRef.current = false
    scratchRef.current = true
    applyScratchMode(editor)
    setInkTool('scratch')
    setLassoMenu(null)
  }, [])

  const stampThisEditor = useCallback((editor: Editor, board: TiedBoard | null) => {
    if (!board) return
    const activeIdNow = activeBoardIdRef.current
    if (editorBoardIdRef.current !== board.id) return
    if (activeIdNow !== board.id) return
    void stampBoardImages(editor, board, {
      boardId: board.id,
      activeBoardId: activeIdNow,
      persistenceKey: canvasKeyRef.current,
    })
  }, [])

  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor
      editorBoardIdRef.current = activeBoardIdRef.current
      editor.updateInstanceState({ isGridMode: true })
      goDraw(editor)
      const pending = stampRef.current
      if (pending?.surface === 'stamped' && pending.id === activeBoardIdRef.current) {
        window.setTimeout(() => {
          if (editorRef.current !== editor) return
          stampThisEditor(editor, pending)
        }, 80)
      }

      const unsubCreate = editor.sideEffects.registerAfterCreateHandler('shape', (shape) => {
        if (!lassoRef.current) return
        if (shape.type !== 'draw' && shape.type !== 'highlight') return
        setLassoMenu(null)
      })

      const unsubScribble = editor.sideEffects.registerAfterChangeHandler('shape', (prev, next) => {
        const before = prev as TLShape
        const after = next as TLShape
        if (after.type !== 'draw' && after.type !== 'highlight') return
        const wasDone = Boolean((before.props as { isComplete?: boolean }).isComplete)
        const isDone = Boolean((after.props as { isComplete?: boolean }).isComplete)
        if (wasDone || !isDone) return
        queueMicrotask(() => {
          if (!editor.getShape(after.id)) return
          if (lassoRef.current) {
            const hits = finishLassoStroke(editor, after)
            if (hits.length > 0) {
              setLassoMenu({ ...lassoMenuPoint(editor), count: hits.length })
            } else {
              setLassoMenu(null)
            }
            return
          }
          const result = finishInkStroke(editor, after, { dedicatedScratch: scratchRef.current })
          if (scratchRef.current && result === 'tap') goDraw(editor)
        })
      })

      return () => {
        unsubCreate()
        unsubScribble()
      }
    },
    [goDraw, stampThisEditor],
  )

  const applyBoard = useCallback((board: TiedBoard) => {
    const switching = activeBoardIdRef.current !== board.id
    applyingRef.current = board.id
    stampRef.current = board.surface === 'stamped' ? board : null
    if (switching) {
      editorRef.current = null
      editorBoardIdRef.current = null
      setWorkspace((root) => {
        const next = upsertTiedBoard(root, { id: board.id, title: board.title, boardKey: board.boardKey })
        persistWorkspace(next.root)
        persistActiveId(next.node.id)
        return next.root
      })
      persistActiveId(board.id)
      setActiveId(board.id)
    }
    setTied(board)
    try {
      sessionStorage.setItem(TIED_SEEN, board.id)
    } catch {
      // private mode
    }
  }, [])

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('board')

    const loadId = async (id: string) => {
      const res = await fetch(apiUrl(`/api/boards/${encodeURIComponent(id)}`))
      if (!res.ok) return
      const data = (await res.json()) as { board?: TiedBoard }
      if (data.board) applyBoard(data.board)
    }

    if (fromUrl) {
      void loadId(fromUrl)
    } else {
      // Home stays today's scratch until a live site click writes ACTIVE.
      setWorkspace((root) => {
        const cleaned = pruneOtherTiedBoards(root, '')
        persistWorkspace(cleaned)
        return cleaned
      })
      if (loadActiveId().startsWith('board:')) {
        persistActiveId(FIRST_BOARD_ID)
        setActiveId(FIRST_BOARD_ID)
        setTied(null)
      }
    }

    const receivePending = async () => {
      try {
        const res = await fetch(apiUrl('/api/boards/pending'))
        if (!res.ok) return
        const data = (await res.json()) as { id?: string | null; board?: TiedBoard | null; updated?: string | null }
        const board = data.board
        if (!board) return
        const stamp = Date.parse(data.updated || board.updated || board.createdAt)
        if (!Number.isFinite(stamp) || Date.now() - stamp > PENDING_FRESH_MS) {
          return
        }
        if (appliedPendingRef.current === board.id) return
        appliedPendingRef.current = board.id
        applyBoard(board)
      } catch {
        // Home scratch stays as-is
      }
    }

    const beat = async () => {
      try {
        await fetch(apiUrl('/api/boards/heartbeat'), { method: 'POST', cache: 'no-store' })
      } catch {
        // pending poll still marks the pad seen
      }
    }

    void beat()
    void receivePending()
    const timer = window.setInterval(() => {
      void beat()
      void receivePending()
    }, 1500)
    return () => {
      window.clearInterval(timer)
    }
  }, [applyBoard])

  useEffect(() => {
    const board = tied
    if (!board || board.surface !== 'stamped') return
    if (activeBoardId !== board.id) return
    if (canvasKey !== board.persistenceKey && canvasKey !== board.boardKey) return
    const run = () => {
      const editor = editorRef.current
      if (!editor) return
      stampThisEditor(editor, board)
    }
    run()
    const timer = window.setInterval(run, 1500)
    return () => window.clearInterval(timer)
  }, [tied, activeBoardId, canvasKey, stampThisEditor])

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const editor = editorRef.current
      if (!editor) return
      try {
        await parkSnapshot(editor, { meta: parkMeta })
        setStatus((current) => (current === 'offline' ? '' : current))
      } catch {
        setStatus('offline')
      }
    }, 4000)
    return () => window.clearInterval(timer)
  }, [parkMeta])

  const parkNow = async () => {
    const editor = editorRef.current
    if (!editor) return
    setBusy(true)
    try {
      await parkSnapshot(editor, { parked: true, includeImage: true, meta: parkMeta })
      setStatus('asking…')
      const started = Date.now()
      for (let i = 0; i < 45; i += 1) {
        const res = await fetch(apiUrl('/api/bookkeep'))
        if (res.ok) {
          const body = (await res.json()) as { events?: { kind?: string; at?: string }[] }
          const asked = body.events?.some((ev) => ev.kind === 'ask' && ev.at && Date.parse(ev.at) >= started - 2000)
          if (asked) {
            setStatus('asked')
            return
          }
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000))
      }
      setStatus('parked')
    } catch {
      setStatus('failed')
    } finally {
      setBusy(false)
    }
  }

  const runLassoAction = (fn: (editor: Editor) => void) => {
    const editor = editorRef.current
    if (!editor) return
    fn(editor)
    setLassoMenu(null)
    if (lassoRef.current) applyLassoMode(editor)
  }

  const onLassoPointerUp = (fn: (editor: Editor) => void) => (event: PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.pointerType === 'mouse' && event.button !== 0) return
    runLassoAction(fn)
  }

  const hudStatus = busy ? 'parking…' : status

  return (
    <div className="canvas-shell">
      <PairingCard />
      {lassoMenu ? (
        <div
          className="lasso-menu"
          role="toolbar"
          aria-label="Lasso actions"
          style={{ left: lassoMenu.x, top: lassoMenu.y }}
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
        >
          <button
            type="button"
            disabled={busy}
            onPointerUp={onLassoPointerUp(() => {
              void parkNow()
            })}
            onClick={(event) => event.preventDefault()}
          >
            Park
          </button>
          <button
            type="button"
            onPointerUp={onLassoPointerUp((editor) => {
              const ids = editor.getSelectedShapeIds()
              if (ids.length === 0) return
              editor.markHistoryStoppingPoint('lasso delete')
              editor.deleteShapes(ids)
            })}
            onClick={(event) => event.preventDefault()}
          >
            Delete
          </button>
          <button
            type="button"
            onPointerUp={onLassoPointerUp((editor) => {
              const ids = editor.getSelectedShapeIds()
              if (ids.length === 0) return
              editor.duplicateShapes(ids, { x: 24, y: 24 })
            })}
            onClick={(event) => event.preventDefault()}
          >
            Duplicate
          </button>
          {lassoMenu.count >= 2 ? (
            <button
              type="button"
              onPointerUp={onLassoPointerUp((editor) => {
                const ids = editor.getSelectedShapeIds()
                if (ids.length < 2) return
                editor.groupShapes(ids)
              })}
              onClick={(event) => event.preventDefault()}
            >
              Group
            </button>
          ) : null}
          <button
            type="button"
            onPointerUp={onLassoPointerUp((editor) => {
              editor.setSelectedShapes([])
            })}
            onClick={(event) => event.preventDefault()}
          >
            Cancel
          </button>
        </div>
      ) : null}
      <div className="canvas-workspace">
        <FilesExplorer
          root={workspace}
          activeId={activeFile?.id ?? FIRST_BOARD_ID}
          onRootChange={setWorkspace}
          onOpenFile={(id) => {
            if (id !== activeBoardIdRef.current) {
              editorRef.current = null
              editorBoardIdRef.current = null
            }
            persistActiveId(id)
            setActiveId(id)
            setLassoMenu(null)
          }}
        />
        <div className="canvas-stage">
          <div className="hud">
            {tied && activeFile?.id === tied.id ? <TiedBoardDock board={tied} /> : null}
            {hudStatus ? (
              <span
                className={`hud-status${hudStatus === 'failed' || hudStatus === 'offline' ? ' is-error' : ''}`}
              >
                {hudStatus}
              </span>
            ) : null}
            <button
              type="button"
              aria-pressed={inkTool === 'draw'}
              onClick={() => {
                const editor = editorRef.current
                if (editor) goDraw(editor)
              }}
            >
              Draw
            </button>
            <button
              type="button"
              aria-pressed={inkTool === 'scratch'}
              onClick={() => {
                const editor = editorRef.current
                if (editor) goScratch(editor)
              }}
            >
              Scratch
            </button>
            <button
              type="button"
              aria-pressed={inkTool === 'lasso'}
              onClick={() => {
                const editor = editorRef.current
                if (editor) goLasso(editor)
              }}
            >
              Lasso
            </button>
            <button type="button" disabled={busy} onClick={() => void parkNow()}>
              Park for agent
            </button>
            <a className="hud-link hud-link-quiet" href="/site">
              Site
            </a>
          </div>
          <div className="canvas-ink">
            <Tldraw key={canvasKey} persistenceKey={canvasKey} onMount={onMount} inferDarkMode />
          </div>
        </div>
      </div>
    </div>
  )
}
