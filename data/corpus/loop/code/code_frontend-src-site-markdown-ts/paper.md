# frontend/src/site/markdown.ts

import type { GlossaryEntry } from './types'

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

function inline(text: string, glossary: GlossaryEntry[]) {
  let html = escapeHtml(text)
    .replace(/\[@([a-z0-9-]+)\]/gi, (_, id: string) => cite(id))
    .replace(/\$([^$]{1,80})\$/g, (_, tex: string) => {
      return `<a class="math-term" href="${mathHref(tex)}"><code>${tex}</code></a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) => {
      return `<figure><img src="${src}" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  return gloss(html, glossary)
}

export type TocItem = { id: string; text: string; level: number }

function gistFrom(text: string) {
  const plain = text.replace(/\[@[^\]]+\]/g, '').replace(/[*`]/g, '').trim()
  if (plain.length <= 220) return plain
  return `${plain.slice(0, 217).trim()}…`
}

function closeSection(out: string[], open: boolean) {
  if (open) out.push('</section>')
  return false
}

export function renderMarkdown(
  md: string,
  glossary: GlossaryEntry[] = [],
): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const lines = md.replaceAll('\r\n', '\n').split('\n')
  const out: string[] = []
  let i = 0
  let slugN = 0
  let sectionOpen = false
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const lang = escapeHtml(line.slice(3).trim())
      const buf: string[] = []
      i += 1
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      out.push(`<pre><code class="lang-${lang}">${escapeHtml(buf.join('\n'))}</code></pre>`)
      continue
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const text = heading[2].trim()
      const id = `h-${++slugN}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`
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
