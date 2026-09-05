import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Tldraw, type Editor, type TLShape } from 'tldraw'
import 'tldraw/tldraw.css'
import { apiUrl } from '../api'
import { FilesExplorer } from './FilesExplorer'
import { parkSnapshot } from './inbox'
import { finishLassoStroke, lassoMenuPoint } from './lasso'
import { PairingCard } from './PairingCard'
import { finishInkStroke } from './scratch'
import {
  FIRST_BOARD_ID,
  FIRST_BOARD_KEY,
  findFile,
  firstFile,
  loadActiveId,
  loadWorkspace,
  persistActiveId,
} from './workspace'

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

  const activeFile = findFile(workspace, activeId) ?? firstFile(workspace)
  const canvasKey = activeFile?.persistenceKey ?? FIRST_BOARD_KEY

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

  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor
      editor.updateInstanceState({ isGridMode: true })
      goDraw(editor)

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
    [goDraw],
  )

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const editor = editorRef.current
      if (!editor) return
      try {
        await parkSnapshot(editor)
        setStatus((current) => (current === 'offline' ? '' : current))
      } catch {
        setStatus('offline')
      }
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  const parkNow = async () => {
    const editor = editorRef.current
    if (!editor) return
    setBusy(true)
    try {
      await parkSnapshot(editor, { parked: true, includeImage: true })
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
            persistActiveId(id)
            setActiveId(id)
            setLassoMenu(null)
          }}
        />
        <div className="canvas-stage">
          <div className="hud">
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
          <Tldraw key={canvasKey} persistenceKey={canvasKey} onMount={onMount} inferDarkMode />
        </div>
      </div>
    </div>
  )
}
