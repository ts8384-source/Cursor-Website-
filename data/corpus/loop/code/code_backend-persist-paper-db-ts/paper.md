# backend/persist/paper-db.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { papersDir } from '../paths.ts'
import { CURATED } from './paper-curated.ts'
import { listPapers, type PaperRecord } from './papers-catalog.ts'

export type MathTerm = { term: string; def: string; paperId: string }

export type PaperFigure = { paperId: string; label: string; note: string }

export type ExecutionLink = { paperId: string; path: string; how: string }

export type PaperDbRecord = PaperRecord & {
  summary: string
  math: MathTerm[]
  figures: PaperFigure[]
  executedIn: ExecutionLink[]
  permanent: true
}

export type PaperDb = {
  updatedAt: string
  permanent: true
  papers: PaperDbRecord[]
  math: MathTerm[]
  figures: PaperFigure[]
  missingFromDisk: string[]
}

function extractSummary(raw: string, fallback: string) {
  const body = raw.split(/## Extracted text[^\n]*/i)[1] ?? raw
  const abs = /ABSTRACT\s+([\s\S]{80,900}?)(?:\nCCS |\n1\s*\n|\n1\s+|INTRODUCTION)/i.exec(body)
  if (abs) return abs[1].replace(/\s+/g, ' ').trim().slice(0, 600)
  const para = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 80 && !l.startsWith('#') && !l.startsWith('-'))
  return (para[0] ?? fallback).replace(/\s+/g, ' ').trim().slice(0, 600)
}

function extractFigures(raw: string, paperId: string): PaperFigure[] {
  const out: PaperFigure[] = []
  const re = /(?:Figure|Fig\.?)\s+(\d+[A-Za-z]?)[:.\s—-]+([^\n]{12,180})/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    out.push({ paperId, label: `Figure ${m[1]}`, note: m[2].replace(/\s+/g, ' ').trim() })
    if (out.length >= 6) break
  }
  return out
}

function extractInlineMath(raw: string, paperId: string): MathTerm[] {
  const seen = new Set<string>()
  const out: MathTerm[] = []
  const re = /\$([^$]{1,48})\$/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    const term = m[1].trim()
    if (seen.has(term) || term.length < 2) continue
    seen.add(term)
    out.push({ term, def: `Notation from ${paperId}`, paperId })
    if (out.length >= 8) break
  }
  return out
}

export function rebuildPaperDb(): PaperDb {
  const onDisk = listPapers()
  const byId = new Map(onDisk.map((p) => [p.id, p]))
  const curatedIds = CURATED.map((c) => c.id)
  const missingFromDisk = curatedIds.filter((id) => !byId.has(id))
  const papers: PaperDbRecord[] = []
  const math: MathTerm[] = []
  const figures: PaperFigure[] = []

  for (const rec of onDisk) {
    const abs = join(papersDir, `${rec.id}.md`)
    const raw = existsSync(abs) ? readFileSync(abs, 'utf8') : ''
    const cur = CURATED.find((c) => c.id === rec.id)
    const summary = cur?.summary || extractSummary(raw, rec.title)
    const fig = [...(cur?.diagrams.map((d) => ({ paperId: rec.id, ...d })) ?? []), ...extractFigures(raw, rec.id)]
    const mathTerms = [
      ...(cur?.math.map((t) => ({ ...t, paperId: rec.id })) ?? []),
      ...extractInlineMath(raw, rec.id),
    ]
    const executedIn = (cur?.executedIn ?? []).map((e) => ({ paperId: rec.id, ...e }))
    papers.push({ ...rec, summary, math: mathTerms, figures: fig, executedIn, permanent: true })
    math.push(...mathTerms)
    figures.push(...fig)
  }

  const db: PaperDb = {
    updatedAt: new Date().toISOString(),
    permanent: true,
    papers,
    math,
    figures,
    missingFromDisk,
  }
  writeFileSync(join(papersDir, 'db.json'), JSON.stringify(db, null, 2), 'utf8')
  return db
}

export function loadPaperDb(): PaperDb {
  const path = join(papersDir, 'db.json')
  const disk = listPapers()
  if (existsSync(path)) {
    try {
      const cached = JSON.parse(readFileSync(path, 'utf8')) as PaperDb
      const ids = new Set(cached.papers.map((p) => p.id))
      if (disk.every((p) => ids.has(p.id)) && cached.papers.length === disk.length) return cached
    } catch {
      // rebuild
    }
  }
  return rebuildPaperDb()
}

export function loadPaperRecord(id: string) {
  return loadPaperDb().papers.find((p) => p.id === id) ?? null
}

export function mathLexicon() {
  const db = loadPaperDb()
  const byTerm = new Map<string, MathTerm>()
  for (const term of db.math) {
    if (!byTerm.has(term.term.toLowerCase())) byTerm.set(term.term.toLowerCase(), term)
  }
  return [...byTerm.values()].sort((a, b) => a.term.localeCompare(b.term))
}
