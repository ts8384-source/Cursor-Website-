import type { GlossaryEntry } from './types'
import { renderKatex, unicodeMathToTex } from './katexRender'

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function cite(id: string) {
  const href = `/site/papers#${encodeURIComponent(id)}`
  return `<a class="cite-chip" href="${href}">${escapeHtml(id)}</a>`
}

function mathHref(term: string) {
  const slug = term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `/site/maps#math-${encodeURIComponent(slug || 'term')}`
}

function gloss(html: string, glossary: GlossaryEntry[]) {
  const terms = glossary
    .map((g) => g.term.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
  let out = html
  for (const term of terms) {
    const entry = glossary.find((g) => g.term === term)
    if (!entry) continue
    const re = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i')
    out = out.replace(re, (_, word: string) => {
      return `<abbr class="gloss" title="${escapeHtml(entry.def)}">${word}</abbr>`
    })
  }
  return out
}

function inlineMath(tex: string) {
  const { html, ok } = renderKatex(tex, false)
  const body = ok ? html : `<code>${escapeHtml(tex)}</code>`
  return `<a class="math-term" href="${mathHref(tex)}" title="Open in math map">${body}</a>`
}

function inline(text: string, glossary: GlossaryEntry[]) {
  // Pull math out before HTML escape so TeX is not entity-mangled.
  const chunks = text.split(/(\$[^$]{1,120}\$)/g)
  const html = chunks
    .map((chunk) => {
      const m = /^\$([^$]{1,120})\$$/.exec(chunk)
      if (m) return inlineMath(m[1])
      return escapeHtml(chunk)
        .replace(/\[@([a-z0-9-]+)\]/gi, (_, id: string) => cite(id))
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) => {
          return `<figure><img src="${src}" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`
        })
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    })
    .join('')
  return gloss(html, glossary)
}

export type TocItem = { id: string; text: string; level: number }

function gistFrom(text: string) {
  const plain = text.replace(/\[@[^\]]+\]/g, '').replace(/[*`]/g, '').trim()
  if (plain.length <= 220) return plain
  return `${plain.slice(0, 217).trim()}…`
}

function renderEqBlock(raw: string) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return ''
  const formula = lines[0]
  const terms = lines
    .slice(1)
    .map((line) => {
      const cut = line.indexOf('|')
      if (cut < 0) return null
      return { term: line.slice(0, cut).trim(), def: line.slice(cut + 1).trim() }
    })
    .filter((row): row is { term: string; def: string } => Boolean(row?.term))

  // Prefer KaTeX for the formula (framework default). Keep callouts under it.
  const texSource = /\\[a-zA-Z]/.test(formula) ? formula : unicodeMathToTex(formula)
  const { html: katexHtml, ok } = renderKatex(texSource, true)
  const formulaHtml = ok
    ? katexHtml
    : `<span class="eq-plain">${escapeHtml(formula)}</span>`

  const callouts = terms
    .map((t) => {
      const termHtml = renderKatex(t.term, false)
      const label = termHtml.ok ? termHtml.html : escapeHtml(t.term)
      return `<li class="eq-callout"><strong class="eq-callout-term">${label}</strong><span>${escapeHtml(t.def)}</span></li>`
    })
    .join('')

  return `<figure class="eq-annotate"><div class="eq-formula" role="img" aria-label="${escapeHtml(formula)}">${formulaHtml}</div>${
    callouts ? `<ol class="eq-callouts">${callouts}</ol>` : ''
  }</figure>`
}

function closeSection(out: string[], open: boolean) {
  if (open) out.push('</section>')
  return false
}

/** Anchors are slug-derived so a link survives edits above it. idPrefix keeps merged topic sections unique. */
export function renderMarkdown(
  md: string,
  glossary: GlossaryEntry[] = [],
  idPrefix = '',
  levelShift = 0,
): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const lines = md.replaceAll('\r\n', '\n').split('\n')
  const out: string[] = []
  const used = new Map<string, number>()
  const headingId = (text: string) => {
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'section'
    const key = idPrefix ? `${idPrefix}--${base}` : base
    const n = (used.get(key) ?? 0) + 1
    used.set(key, n)
    return n === 1 ? key : `${key}-${n}`
  }
  let i = 0
  let sectionOpen = false
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const buf: string[] = []
      i += 1
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      if (lang === 'eq') {
        out.push(renderEqBlock(buf.join('\n')))
        continue
      }
      out.push(`<pre><code class="lang-${escapeHtml(lang)}">${escapeHtml(buf.join('\n'))}</code></pre>`)
      continue
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      const level = Math.min(heading[1].length + levelShift, 4)
      const text = heading[2].trim()
      const id = headingId(text)
      toc.push({ id, text, level })
      if (level >= 2) {
        sectionOpen = closeSection(out, sectionOpen)
        let look = i + 1
        while (look < lines.length && !lines[look].trim()) look += 1
        const lead = look < lines.length && !lines[look].startsWith('#') ? lines[look] : ''
        const gist = lead ? gistFrom(lead) : ''
        out.push(`<section class="lp-section" aria-labelledby="${id}">`)
        sectionOpen = true
        out.push(`<div class="section-head">`)
        out.push(`<h${level} id="${id}">${inline(text, glossary)}</h${level}>`)
        if (gist) {
          out.push(
            `<button type="button" class="gist-toggle" aria-expanded="false" aria-controls="${id}-gist">Section gist</button>`,
          )
        }
        out.push(`</div>`)
        if (gist) {
          out.push(`<p class="section-gist" id="${id}-gist" hidden>${escapeHtml(gist)}</p>`)
        }
      } else {
        sectionOpen = closeSection(out, sectionOpen)
        out.push(`<h${level} id="${id}">${inline(text, glossary)}</h${level}>`)
      }
      i += 1
      continue
    }
    if (line.startsWith('> ')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quote.push(lines[i].slice(2))
        i += 1
      }
      out.push(`<aside class="lp-aside">${inline(quote.join(' '), glossary)}</aside>`)
      continue
    }
    if (line.startsWith('|')) {
      const rows: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i])
        i += 1
      }
      const body = rows.filter((row) => !/^\|\s*-/.test(row))
      const htmlRows = body.map((row, idx) => {
        const cells = row.split('|').slice(1, -1).map((c) => c.trim())
        const tag = idx === 0 ? 'th' : 'td'
        return `<tr>${cells.map((c) => `<${tag}>${inline(c, glossary)}</${tag}>`).join('')}</tr>`
      })
      out.push(`<table>${htmlRows.join('')}</table>`)
      continue
    }
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(`<li>${inline(lines[i].slice(2), glossary)}</li>`)
        i += 1
      }
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ''), glossary)}</li>`)
        i += 1
      }
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }
    if (!line.trim()) {
      i += 1
      continue
    }
    const para: string[] = [line]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('|') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('```') &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      para.push(lines[i])
      i += 1
    }
    out.push(`<p>${inline(para.join(' '), glossary)}</p>`)
  }
  closeSection(out, sectionOpen)
  return { html: out.join('\n'), toc }
}
