import { useCallback, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import {
  HOME_ID,
  addBoard,
  addFolder,
  persistActiveId,
  persistWorkspace,
  type WorkspaceNode,
} from './workspace'

const EXPANDED_KEY = 'ipad-files-expanded'

function loadExpanded() {
  try {
    return localStorage.getItem(EXPANDED_KEY) === '1'
  } catch {
    return false
  }
}

function persistExpanded(expanded: boolean) {
  try {
    localStorage.setItem(EXPANDED_KEY, expanded ? '1' : '0')
  } catch {
    // private mode
  }
}

function FolderGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.8l1.2 1.4H12.5A1.5 1.5 0 0 1 14 4.9v7.6A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5z"
      />
    </svg>
  )
}

function FileGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.2 1.5h4.3L12.5 5.5v8.3A1.2 1.2 0 0 1 11.3 15H4.2A1.2 1.2 0 0 1 3 13.8V2.7A1.2 1.2 0 0 1 4.2 1.5zm4.1.8v3.4h3.4z"
      />
    </svg>
  )
}

function TreeRow({
  node,
  depth,
  open,
  activeId,
  folderId,
  onToggleDir,
  onOpenFile,
  onPickFolder,
}: {
  node: WorkspaceNode
  depth: number
  open: Set<string>
  activeId: string
  folderId: string
  onToggleDir: (path: string) => void
  onOpenFile: (id: string) => void
  onPickFolder: (id: string) => void
}) {
  const isDir = node.type === 'dir'
  const expanded = isDir && open.has(node.id)
  const active = !isDir && node.id === activeId
  const target = isDir && node.id === folderId

  return (
    <div className="files-tree-branch">
      <button
        type="button"
        className={`files-tree-row${active ? ' is-active' : ''}${target ? ' is-target' : ''}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        onClick={() => {
          if (isDir) {
            onPickFolder(node.id)
            onToggleDir(node.id)
          } else {
            onOpenFile(node.id)
          }
        }}
      >
        <span className="files-tree-chevron">{isDir ? (expanded ? '▾' : '▸') : ''}</span>
        <span className="files-glyph">{isDir ? <FolderGlyph /> : <FileGlyph />}</span>
        <span className="files-tree-name">{node.name}</span>
      </button>
      {expanded &&
        node.children?.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            open={open}
            activeId={activeId}
            folderId={folderId}
            onToggleDir={onToggleDir}
            onOpenFile={onOpenFile}
            onPickFolder={onPickFolder}
          />
        ))}
    </div>
  )
}

export function FilesExplorer({
  root,
  activeId,
  onRootChange,
  onOpenFile,
}: {
  root: WorkspaceNode
  activeId: string
  onRootChange: (root: WorkspaceNode) => void
  onOpenFile: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(loadExpanded)
  const [open, setOpen] = useState<Set<string>>(() => new Set([HOME_ID]))
  const [folderId, setFolderId] = useState(HOME_ID)
  const pointerToggled = useRef(false)

  const setPanel = useCallback((next: boolean) => {
    setExpanded(next)
    persistExpanded(next)
  }, [])

  const togglePanel = useCallback(() => {
    setExpanded((current) => {
      const next = !current
      persistExpanded(next)
      return next
    })
  }, [])

  const onHandlePointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      pointerToggled.current = true
      togglePanel()
    },
    [togglePanel],
  )

  const onHandleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      if (pointerToggled.current) {
        pointerToggled.current = false
        return
      }
      togglePanel()
    },
    [togglePanel],
  )

  const toggleDir = useCallback((id: string) => {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const commitRoot = useCallback(
    (next: WorkspaceNode) => {
      persistWorkspace(next)
      onRootChange(next)
    },
    [onRootChange],
  )

  const openFile = useCallback(
    (id: string) => {
      persistActiveId(id)
      onOpenFile(id)
    },
    [onOpenFile],
  )

  const onAddFolder = useCallback(() => {
    const { root: next, id } = addFolder(root, folderId)
    commitRoot(next)
    setOpen((current) => new Set(current).add(folderId).add(id))
    setFolderId(id)
    setPanel(true)
  }, [commitRoot, folderId, root, setPanel])

  const onAddBoard = useCallback(() => {
    const { root: next, node } = addBoard(root, folderId)
    commitRoot(next)
    setOpen((current) => new Set(current).add(folderId))
    openFile(node.id)
    setPanel(true)
  }, [commitRoot, folderId, openFile, root, setPanel])

  return (
    <aside className={`files-panel${expanded ? ' is-expanded' : ' is-collapsed'}`} aria-label="Files">
      {expanded && (
        <div className="files-tree">
          <div className="files-tree-head">Files</div>
          <div className="files-tree-actions">
            <button type="button" onClick={onAddFolder}>
              + Folder
            </button>
            <button type="button" onClick={onAddBoard}>
              + Board
            </button>
          </div>
          <div className="files-tree-body">
            <TreeRow
              node={root}
              depth={0}
              open={open}
              activeId={activeId}
              folderId={folderId}
              onToggleDir={toggleDir}
              onOpenFile={openFile}
              onPickFolder={setFolderId}
            />
          </div>
        </div>
      )}

      <div className="files-divider">
        <span className="files-divider-line" />
        <button
          type="button"
          className="files-handle"
          aria-expanded={expanded}
          aria-label={expanded ? 'Close files' : 'Expand files'}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onPointerUp={onHandlePointerUp}
          onClick={onHandleClick}
        />
      </div>
    </aside>
  )
}
