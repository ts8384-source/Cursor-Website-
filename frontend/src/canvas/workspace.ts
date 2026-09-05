export type WorkspaceNode = {
  id: string
  name: string
  type: 'file' | 'dir'
  persistenceKey?: string
  children?: WorkspaceNode[]
}

export const HOME_ID = 'home'
export const FIRST_BOARD_ID = 'whiteboard'
export const FIRST_BOARD_KEY = 'ipad-cursor-canvas'

const TREE_KEY = 'ipad-workspace-tree'
const ACTIVE_KEY = 'ipad-workspace-active'

export const defaultWorkspace = (): WorkspaceNode => ({
  id: HOME_ID,
  name: 'Home',
  type: 'dir',
  children: [
    {
      id: FIRST_BOARD_ID,
      name: 'Whiteboard',
      type: 'file',
      persistenceKey: FIRST_BOARD_KEY,
    },
  ],
})

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function loadWorkspace(): WorkspaceNode {
  try {
    const raw = localStorage.getItem(TREE_KEY)
    if (!raw) return defaultWorkspace()
    const parsed = JSON.parse(raw) as WorkspaceNode
    if (parsed?.id === HOME_ID && parsed.type === 'dir') return parsed
  } catch {
    // private mode / bad json
  }
  return defaultWorkspace()
}

export function persistWorkspace(root: WorkspaceNode) {
  try {
    localStorage.setItem(TREE_KEY, JSON.stringify(root))
  } catch {
    // private mode
  }
}

export function loadActiveId(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) ?? FIRST_BOARD_ID
  } catch {
    return FIRST_BOARD_ID
  }
}

export function persistActiveId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id)
  } catch {
    // private mode
  }
}

export function findNode(root: WorkspaceNode, id: string): WorkspaceNode | null {
  if (root.id === id) return root
  for (const child of root.children ?? []) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

export function findFile(root: WorkspaceNode, id: string): WorkspaceNode | null {
  const node = findNode(root, id)
  return node?.type === 'file' ? node : null
}

export function firstFile(root: WorkspaceNode): WorkspaceNode | null {
  if (root.type === 'file') return root
  for (const child of root.children ?? []) {
    const found = firstFile(child)
    if (found) return found
  }
  return null
}

function nextName(siblings: WorkspaceNode[], base: string) {
  const taken = new Set(siblings.map((node) => node.name))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base} ${n}`)) n += 1
  return `${base} ${n}`
}

function insertChild(root: WorkspaceNode, parentId: string, child: WorkspaceNode): WorkspaceNode {
  if (root.id === parentId && root.type === 'dir') {
    return { ...root, children: [...(root.children ?? []), child] }
  }
  if (!root.children) return root
  return {
    ...root,
    children: root.children.map((node) => insertChild(node, parentId, child)),
  }
}

export function addFolder(root: WorkspaceNode, parentId: string): { root: WorkspaceNode; id: string } {
  const parent = findNode(root, parentId)
  const targetId = parent?.type === 'dir' ? parentId : HOME_ID
  const siblings = findNode(root, targetId)?.children ?? []
  const id = newId('folder')
  const child: WorkspaceNode = {
    id,
    name: nextName(siblings, 'Folder'),
    type: 'dir',
    children: [],
  }
  return { root: insertChild(root, targetId, child), id }
}

export function addBoard(root: WorkspaceNode, parentId: string): { root: WorkspaceNode; node: WorkspaceNode } {
  const parent = findNode(root, parentId)
  const targetId = parent?.type === 'dir' ? parentId : HOME_ID
  const siblings = findNode(root, targetId)?.children ?? []
  const id = newId('board')
  const node: WorkspaceNode = {
    id,
    name: nextName(siblings, 'Whiteboard'),
    type: 'file',
    persistenceKey: `ipad-canvas-${id}`,
  }
  return { root: insertChild(root, targetId, node), node }
}

export function flattenNodes(root: WorkspaceNode, limit = 11): WorkspaceNode[] {
  const out: WorkspaceNode[] = []
  const walk = (node: WorkspaceNode) => {
    if (out.length >= limit) return
    if (node.id !== HOME_ID) out.push(node)
    for (const child of node.children ?? []) walk(child)
  }
  walk(root)
  return out
}
