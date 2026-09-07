import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { dataDir, root } from '../paths.ts'
import { sandboxSite } from './sandbox-pages.ts'

const execFileAsync = promisify(execFile)

export type LabStatus = 'active' | 'human-check-pending' | 'closed'

export type SandboxLab = {
  id: string
  name: string
  branch: string
  base: string
  worktree: string | null
  status: LabStatus
  createdAt: string
  updatedAt: string
  proposeNote?: string
  proposedAt?: string
  error?: string
}

export type LessonRecord = {
  id: string
  labId?: string
  note: string
  parentId?: string
  outcome?: string
  createdAt: string
}

function sandboxDir() {
  const dir = join(dataDir, 'sandbox')
  mkdirSync(dir, { recursive: true })
  return dir
}

function labsFile() {
  return join(sandboxDir(), 'labs.json')
}

function lessonsFile() {
  return join(sandboxDir(), 'lessons.json')
}

function labsRoot() {
  return join(dirname(root), `${basename(root)}.labs`)
}

async function git(args: string[], cwd = root) {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 30_000,
  })
  return { stdout: stdout.trim(), stderr: stderr.trim() }
}

function readLabs(): SandboxLab[] {
  const file = labsFile()
  if (!existsSync(file)) return []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { labs?: unknown[] }
    return (parsed.labs ?? []).filter((row): row is SandboxLab => {
      if (!row || typeof row !== 'object') return false
      const o = row as SandboxLab
      return typeof o.id === 'string' && typeof o.branch === 'string'
    })
  } catch {
    return []
  }
}

function writeLabs(labs: SandboxLab[]) {
  writeFileSync(labsFile(), `${JSON.stringify({ labs }, null, 2)}\n`, 'utf8')
}

function readLessons(): LessonRecord[] {
  const file = lessonsFile()
  if (!existsSync(file)) return []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { lessons?: LessonRecord[] }
    return Array.isArray(parsed.lessons) ? parsed.lessons : []
  } catch {
    return []
  }
}

function writeLessons(lessons: LessonRecord[]) {
  writeFileSync(lessonsFile(), `${JSON.stringify({ lessons }, null, 2)}\n`, 'utf8')
}

export function sanitizeLabName(raw?: string) {
  const given = (raw ?? '').trim()
  const base = given.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (given && !base) throw new Error('name must be letters, numbers, hyphens')
  const name = (base || `lab-${Date.now().toString(36)}`).slice(0, 40)
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error('name must be letters, numbers, hyphens')
  return name
}

export async function resolveDefaultBranch() {
  try {
    const { stdout } = await git(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])
    const short = stdout.replace(/^origin\//, '')
    if (short === 'main' || short === 'master') return short
  } catch {
    /* local only */
  }
  for (const name of ['main', 'master']) {
    try {
      await git(['rev-parse', '--verify', name])
      return name
    } catch {
      /* try next */
    }
  }
  const { stdout } = await git(['rev-parse', '--abbrev-ref', 'HEAD'])
  return stdout || 'HEAD'
}

export function listSandbox() {
  const site = sandboxSite()
  return {
    implemented: true,
    requireDocker: false,
    autoMerge: false,
    policy:
      'Fork/lab: branch + optional worktree from main/master. Website sandbox: data/md/sandbox/ lanes idea|code|research. Coding stays in the lab until the operator says send back. POST /api/sandbox/propose is human-check. POST /api/sandbox/promote copies sandbox MD to data/md/ only after “promote to main”. Do not auto-merge. Do not force-push. No Docker mandate.',
    labs: readLabs(),
    lessons: readLessons(),
    labsRoot: labsRoot(),
    pages: site.pages,
    lanes: site.lanes,
    sitePolicy: site.policy,
  }
}

export async function forkSandbox(input: { name?: string } = {}) {
  const name = sanitizeLabName(input.name)
  const labs = readLabs()
  if (labs.some((lab) => lab.name === name && lab.status !== 'closed')) {
    throw new Error(`lab ${name} already active`)
  }
  const now = new Date().toISOString()
  const id = `lab-${Date.now().toString(36)}-${name}`
  const base = await resolveDefaultBranch()
  const branch = `lab/${name}`
  const worktree = join(labsRoot(), name)
  let error: string | undefined
  let worktreePath: string | null = null

  try {
    await git(['rev-parse', '--verify', branch])
  } catch {
    await git(['branch', branch, base])
  }

  mkdirSync(labsRoot(), { recursive: true })
  if (existsSync(worktree)) {
    error = `worktree path already exists: ${worktree}`
  } else {
    try {
      await git(['worktree', 'add', worktree, branch])
      worktreePath = worktree
    } catch (err) {
      error = err instanceof Error ? err.message : 'worktree add failed'
    }
  }

  const lab: SandboxLab = {
    id,
    name,
    branch,
    base,
    worktree: worktreePath,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    error,
  }
  labs.push(lab)
  writeLabs(labs)
  return lab
}

export function proposeSandbox(input: { id?: string; name?: string; note?: string }) {
  const labs = readLabs()
  const lab = labs.find((row) => row.id === input.id || row.name === input.name)
  if (!lab) throw new Error('lab not found')
  if (lab.status === 'closed') throw new Error('lab is closed')
  const now = new Date().toISOString()
  lab.status = 'human-check-pending'
  lab.proposeNote = input.note?.trim() || 'Human check pending — do not merge.'
  lab.proposedAt = now
  lab.updatedAt = now
  writeLabs(labs)
  return { ...lab, autoMerge: false as const, merge: false as const }
}

export function addLesson(input: { note: string; labId?: string; parentId?: string; outcome?: string }) {
  const note = input.note.trim()
  if (!note) throw new Error('note required')
  const lessons = readLessons()
  if (input.parentId && !lessons.some((row) => row.id === input.parentId)) {
    throw new Error('parent lesson not found')
  }
  const row: LessonRecord = {
    id: `lesson-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    labId: input.labId?.trim() || undefined,
    note,
    parentId: input.parentId?.trim() || undefined,
    outcome: input.outcome?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }
  lessons.push(row)
  writeLessons(lessons)
  return row
}
