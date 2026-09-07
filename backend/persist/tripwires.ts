import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { implementDir } from '../paths.ts'
import { addLesson, listSandbox } from './sandbox.ts'

/** Cheap hire flags. Do not run Mendel Gödel Machine evolution. Do not fake a Docker sandbox. */
export type TripwireState = {
  mgm: {
    armed: boolean
    implemented: true
    userStartsCall: true
    askUserBeforeSuggesting: true
    never: 'production'
    hireOnlyIf: string
    hiredAt?: string
    phrase?: string
  }
  sandbox: {
    implemented: true
    requireDocker: false
    autoMerge: false
    policy: string
    labs: number
  }
}

type Persist = {
  armed: boolean
  hiredAt?: string
  phrase?: string
}

const HIRE_PHRASES = ['hire mgm', 'arm the bouncer', 'hire the bouncer', 'arm mgm']

function persistPath() {
  mkdirSync(implementDir, { recursive: true })
  return join(implementDir, 'tripwires.json')
}

function readPersist(): Persist {
  const file = persistPath()
  if (!existsSync(file)) return { armed: false }
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as Persist
    return { armed: raw.armed === true, hiredAt: raw.hiredAt, phrase: raw.phrase }
  } catch {
    return { armed: false }
  }
}

function writePersist(state: Persist) {
  writeFileSync(persistPath(), `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export function isHirePhrase(raw: string) {
  const t = raw.trim().toLowerCase().replace(/[!.]+$/g, '')
  return HIRE_PHRASES.includes(t)
}

export function tripwires(): TripwireState {
  const persist = readPersist()
  const sandbox = listSandbox()
  return {
    mgm: {
      armed: persist.armed === true,
      implemented: true,
      userStartsCall: true,
      askUserBeforeSuggesting: true,
      never: 'production',
      hireOnlyIf:
        'armed stays false until the user explicitly says hire MGM (or arm the bouncer). If stuck, ask the operator first — do not auto-arm. MGM is a separate hired bouncer, not everyday mash. The hire hook is implemented (POST /api/tripwires/hire). No Mendel Gödel Machine evolution. Never call this production.',
      hiredAt: persist.hiredAt,
      phrase: persist.phrase,
    },
    sandbox: {
      implemented: true,
      requireDocker: false,
      autoMerge: false,
      policy: sandbox.policy,
      labs: sandbox.labs.filter((lab) => lab.status !== 'closed').length,
    },
  }
}

export function hireMgm(phrase: string) {
  if (!isHirePhrase(phrase)) {
    throw new Error('user must say hire MGM (or arm the bouncer). Do not auto-arm.')
  }
  const now = new Date().toISOString()
  writePersist({ armed: true, hiredAt: now, phrase: phrase.trim() })
  return tripwires()
}

export function disarmMgm() {
  writePersist({ armed: false })
  return tripwires()
}

export function addMgmLesson(input: { note: string; parentId?: string; labId?: string; outcome?: string }) {
  return addLesson(input)
}
