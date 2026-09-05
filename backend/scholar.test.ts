import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { listPages, loadPage, parseFrontmatter } from './persist/pages.ts'
import { listPapers, parsePaperHeader } from './persist/papers-catalog.ts'
import { toolCatalog } from './persist/tool-catalog.ts'
import { siteOverview } from './persist/overview.ts'
import { isBlockedIp, parseArxivId, parseHttpUrl } from './ingest/fetch-safe.ts'

describe('scholar pages', () => {
  it('parses frontmatter lists and glossary', () => {
    const { data, body } = parseFrontmatter(
      '---\ntitle: T\nslug: t\nquestions:\n  - One?\nglossary:\n  - term: ground\n    def: Isolated index\n---\n# Hello\n',
    )
    assert.equal(data.title, 'T')
    assert.deepEqual(data.questions, ['One?'])
    assert.deepEqual(data.glossary, [{ term: 'ground', def: 'Isolated index' }])
    assert.match(body, /# Hello/)
  })

  it('lists CONTROL and overview from disk', () => {
    const slugs = listPages().map((p) => p.slug)
    for (const need of ['overview', 'hybrid-rag', 'inbox', 'papers', 'control', 'gaps']) {
      assert.ok(slugs.includes(need), `missing ${need}`)
    }
    const control = loadPage('control')
    assert.ok(control)
    assert.equal(control.path, 'content/CONTROL.md')
    assert.match(control.body, /Agent-computer interface/)
  })
})

describe('papers catalog', () => {
  it('parses Living Papers header', () => {
    const rec = parsePaperHeader(
      '# Living Papers\n\n- **id:** living-papers-heer-2023\n- **list:** frontend\n- **authors:** Heer\n- **year:** 2023\n- **venue:** UIST\n- **oa_url:** https://example.org\n- **arxiv:** n/a\n',
      'x',
    )
    assert.equal(rec?.id, 'living-papers-heer-2023')
    assert.equal(rec?.list, 'frontend')
  })

  it('lists ingested OA papers', () => {
    const papers = listPapers()
    assert.ok(papers.length >= 18, `expected ~19 papers, got ${papers.length}`)
    assert.ok(papers.some((p) => p.id === 'living-papers-heer-2023'))
    assert.ok(papers.every((p) => p.id !== 'CATALOG'))
  })
})

describe('ACI catalog', () => {
  it('exposes search and pages tools', () => {
    const ids = toolCatalog().tools.map((t) => t.id)
    assert.ok(ids.includes('search'))
    assert.ok(ids.includes('pages'))
    assert.ok(ids.includes('tools'))
    assert.ok(ids.includes('fetch'))
    assert.ok(ids.includes('papers-fetch'))
  })

  it('overview joins pages and papers', () => {
    const ov = siteOverview()
    assert.ok(ov.pages.some((p) => p.slug === 'control'))
    assert.ok(ov.papers.count >= 18)
  })
})

describe('OA fetch guards', () => {
  it('parses arXiv ids and abs URLs', () => {
    assert.equal(parseArxivId('2407.01449'), '2407.01449')
    assert.equal(parseArxivId('arxiv:2303.14334v2'), '2303.14334')
    assert.equal(parseArxivId('https://arxiv.org/abs/2205.00757'), '2205.00757')
    assert.equal(parseArxivId('https://arxiv.org/pdf/2205.00757.pdf'), '2205.00757')
  })

  it('blocks localhost, private nets, and metadata IPs', () => {
    assert.equal(isBlockedIp('127.0.0.1'), true)
    assert.equal(isBlockedIp('10.17.3.251'), true)
    assert.equal(isBlockedIp('192.168.1.8'), true)
    assert.equal(isBlockedIp('169.254.169.254'), true)
    assert.equal(isBlockedIp('172.16.0.1'), true)
    assert.equal(isBlockedIp('8.8.8.8'), false)
    assert.throws(() => parseHttpUrl('http://127.0.0.1/secret'), /blocked host/)
    assert.throws(() => parseHttpUrl('http://localhost:5175/api'), /blocked host/)
    assert.throws(() => parseHttpUrl('http://169.254.169.254/latest/meta-data'), /blocked host/)
    assert.throws(() => parseHttpUrl('file:///etc/passwd'), /only http/)
  })
})
