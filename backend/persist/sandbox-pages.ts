import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { mdDir } from '../paths.ts'
import { listPages, loadPage, type PageMeta, type SandboxGroup, groupSandboxPages } from './pages.ts'

const PROMOTE_PHRASES = ['promote to main', 'promote this to main']

export function isPromotePhrase(raw?: string) {
  return PROMOTE_PHRASES.includes((raw ?? '').trim().toLowerCase())
}

export function destSlugFor(slug: string, destSlug?: string) {
  const given = (destSlug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (given) return given
  const stripped = slug.replace(/^sandbox-/, '')
  if (!stripped || stripped === slug) throw new Error('destSlug required')
  return stripped
}

export function sandboxSite() {
  const pages = listPages()
  const lanes = groupSandboxPages(pages)
  return {
    implemented: true,
    autoMerge: false,
    policy:
      'Website sandbox: write MD under data/md/sandbox/. Lanes idea | code | research. Chat points at /site/<slug>. Promote copies to data/md/ only after the operator says promote to main. Does not merge git labs.',
    lanes,
    pages: pages.filter((p) => p.sandbox && !p.hidden),
  }
}

function rewritePromoted(raw: string, destSlug: string): string {
  let text = raw.replaceAll('\r\n', '\n')
  if (!text.startsWith('---\n')) {
    return `---\nslug: ${destSlug}\nid: page:${destSlug}\nsandbox: false\n---\n${text}`
  }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) return text
  let yaml = text.slice(4, end)
  const body = text.slice(end + 5)
  const set = (key: string, value: string) => {
    if (new RegExp(`^${key}:`, 'm').test(yaml)) {
      yaml = yaml.replace(new RegExp(`^${key}:.*$`, 'm'), `${key}: ${value}`)
    } else {
      yaml = `${yaml.trimEnd()}\n${key}: ${value}\n`
    }
  }
  set('slug', destSlug)
  set('id', `page:${destSlug}`)
  set('sandbox', 'false')
  yaml = yaml.replace(/^sandboxFor:.*\n/m, '')
  yaml = yaml.replace(/^parent: page:sandbox-.*\n/m, '')
  return `---\n${yaml.trimEnd()}\n---\n${body}`
}

/** Copy a sandbox MD file onto data/md/. Never git-merges. Source stays. */
export function promoteSandboxPage(input: { slug: string; destSlug?: string; phrase?: string; note?: string }) {
  if (!isPromotePhrase(input.phrase)) {
    throw new Error('say “promote to main” — Owner of Judgment. No auto-merge.')
  }
  const slug = (input.slug ?? '').trim()
  if (!slug) throw new Error('slug required')
  const page = loadPage(slug)
  if (!page) throw new Error(`sandbox page not found: ${slug}`)
  if (!page.sandbox) throw new Error(`${slug} is already on main`)
  if (
    (slug === 'sandbox-idea' || slug === 'sandbox-code' || slug === 'sandbox-research') &&
    !(input.destSlug ?? '').trim()
  ) {
    throw new Error('lane index needs destSlug')
  }
  const dest = destSlugFor(slug, input.destSlug)
  if (dest === 'overview' || dest === 'implement' || dest === 'control' || dest === 'docs-home' || dest === 'summary' || dest === 'tutorial') {
    throw new Error(`refuse dest ${dest}`)
  }
  const existing = loadPage(dest)
  if (existing && !existing.sandbox) throw new Error(`dest exists on main: ${dest}`)
  const destPath = join(mdDir, `${dest}.md`)
  if (existsSync(destPath)) throw new Error(`file exists: data/md/${dest}.md`)
  mkdirSync(dirname(destPath), { recursive: true })
  const next = rewritePromoted(page.markdown, dest)
  writeFileSync(destPath, next, 'utf8')
  return {
    ok: true as const,
    merge: false as const,
    autoMerge: false as const,
    sourceSlug: slug,
    destSlug: dest,
    destPath: `data/md/${dest}.md`,
    keptSource: true,
    href: `/site/${dest}`,
    note: input.note?.trim() || 'Copied sandbox MD to main. Source kept. Git lab not merged.',
  }
}

export function notesForPage(pageId: string, lanes?: SandboxGroup) {
  const grouped = lanes ?? groupSandboxPages(listPages())
  const match = (rows: PageMeta[]) =>
    rows.filter((p) => p.sandboxFor === pageId || p.related.includes(pageId) || p.id === pageId)
  return {
    idea: match(grouped.idea),
    code: match(grouped.code),
    research: match(grouped.research),
  }
}
