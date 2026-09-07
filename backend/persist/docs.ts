import { existsSync, rmSync, statSync } from 'node:fs'
import { docsDir } from '../paths.ts'

/** True only when the framework doc folder exists. Boot wiki does not create it. */
export function docsPresent() {
  try {
    return existsSync(docsDir) && statSync(docsDir).isDirectory()
  } catch {
    return false
  }
}

export function docsStatus() {
  const present = docsPresent()
  return {
    present,
    dir: 'data/docs',
    href: present ? '/docs/docs-home' : null,
    bootHref: '/site/overview',
    note: 'Delete data/docs (or POST /api/docs/remove) to drop the framework doc wiki. Boot pages in data/md stay.',
  }
}

export function isRemovePhrase(raw?: string) {
  const t = (raw ?? '').trim().toLowerCase()
  return t === 'are you sure' || t === 'remove doc wiki'
}

/** Delete the whole doc wiki directory. Papers, boards, and data/md are untouched. */
export function removeDocWiki(input: { confirm?: boolean; phrase?: string }) {
  if (!input.confirm) throw new Error('confirm required')
  if (!isRemovePhrase(input.phrase)) throw new Error('say “Are you sure?” to remove the doc wiki')
  if (!docsPresent()) {
    return { ok: true as const, removed: false, alreadyGone: true, dir: 'data/docs' }
  }
  rmSync(docsDir, { recursive: true, force: true })
  return { ok: true as const, removed: true, alreadyGone: false, dir: 'data/docs' }
}
