import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { docsPresent, isRemovePhrase } from './persist/docs.ts'
import { listPages, loadPage, pageTree, parseFrontmatter } from './persist/pages.ts'
import { listPapers, parsePaperHeader } from './persist/papers-catalog.ts'
import { toolCatalog } from './persist/tool-catalog.ts'
import { siteOverview } from './persist/overview.ts'
import { isBlockedIp, parseArxivId, parseHttpUrl } from './ingest/fetch-safe.ts'
import { loadPaperDb } from './persist/paper-db.ts'
import { decayedStrength, forgetMemory, listMemory, remember } from './persist/memory.ts'
import { readBookkeep } from './persist/bookkeep.ts'
import { loadMaps } from './persist/code-map.ts'
import { resolveRegions } from './persist/blankets.ts'
import { collectDiagramPaperRefs } from './ingest/diagram-papers.ts'
import { asEdges, diagramsPayload, loadAllDiagrams } from './persist/diagrams.ts'
import { filterMeta, loadMeta, listMeta } from './persist/meta.ts'
import { buildKnowledgeGraph, filterGraphByProject, graphNeighborhood, resolveGraphId } from './persist/graph.ts'
import { putSandboxTrash, restoreSandboxTrash, trashState } from './persist/sandbox-trash.ts'
import { generateSeed } from './persist/generate-seed.ts'
import { hireMgm, isHirePhrase, tripwires } from './persist/tripwires.ts'
import { addImplement, completeImplement, listImplement } from './persist/implement.ts'
import { sanitizeLabName } from './persist/sandbox.ts'
import { destSlugFor, isPromotePhrase, promoteSandboxPage } from './persist/sandbox-pages.ts'
import { listSandboxFlags, setSandboxFlag } from './persist/sandbox-flags.ts'
import { listCondensedReturns, recordCondensedReturn } from './persist/condensed-return.ts'
import { createTiedBoard, mergeParkMeta, padPresence, pendingTiedBoard, touchPadHeartbeat } from './persist/boards.ts'
import { canStampBoard } from '../frontend/src/canvas/stampGuard.ts'
import { citeOrFetchEnvelope, groundClaims, namedRefs, notInDbHint } from './retrieve/cite-or-fetch.ts'

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
    for (const need of [
      'overview',
      'hybrid-rag',
      'inbox',
      'papers',
      'control',
      'gaps',
      'summaries',
      'diagrams',
      'maps',
      'memory',
      'execution',
      'tied-boards',
      'knowledge-graph',
      'agents',
      'agents-coding',
      'agents-coding-generate',
      'agents-coding-debug',
      'agents-fetch',
      'agents-generate',
      'implement',
      'wiki-writing',
    ]) {
      assert.ok(slugs.includes(need), `missing ${need}`)
    }
    const flagged = loadPage('flagged-schemes')
    assert.ok(flagged)
    assert.equal(flagged.hidden, true)
    assert.equal(flagged.bin, 'doc')
    const control = loadPage('control')
    assert.ok(control)
    assert.equal(control.path, 'content/CONTROL.md')
    assert.equal(control.bin, 'doc')
    assert.equal(control.href, '/docs/control')
    assert.equal(loadPage('tutorial')?.bin, 'boot')
    assert.equal(loadPage('summary')?.bin, 'boot')
    assert.equal(loadPage('docs-home')?.bin, 'doc')
    assert.ok(docsPresent())
    assert.equal(isRemovePhrase('Are you sure'), true)
    assert.match(control.body, /Agent-computer interface/)
    assert.match(control.body, /Cite-or-fetch/)
    assert.match(control.body, /Later: coding-scheme \+ research-assistant/)
    assert.match(control.body, /depth/)
    assert.match(control.body, /pageBudget/)
    const writing = loadPage('wiki-writing')
    assert.ok(writing)
    assert.equal(writing.depth, 'long')
    assert.ok(writing.body.length > 2500)
  })

  it('parses depth and pageBudget', () => {
    const { data } = parseFrontmatter(
      '---\ntitle: T\nslug: t\ndepth: long\npageBudget: 800\n---\n# Hello\n',
    )
    assert.equal(data.depth, 'long')
    assert.equal(data.pageBudget, 800)
  })

  it('nests agent hats under agents and omits hidden pages from the tree', () => {
    const pages = listPages()
    const bootTree = pageTree(pages.filter((p) => p.bin === 'boot'))
    const tree = pageTree(pages.filter((p) => p.bin === 'doc'))
    assert.equal(bootTree.some((n) => n.slug === 'agents' || n.slug === 'hybrid-rag'), false)
    assert.ok(bootTree.some((n) => n.slug === 'overview'))
    assert.ok(bootTree.some((n) => n.slug === 'tutorial'))
    assert.ok(bootTree.some((n) => n.slug === 'summary'))
    assert.equal(tree.some((n) => n.slug === 'flagged-schemes'), false)
    const agents = tree.find((n) => n.slug === 'agents')
    assert.ok(agents)
    assert.deepEqual(
      agents.children.map((c) => c.slug),
      ['agents-fetch', 'agents-coding', 'agents-generate'],
    )
    assert.equal(
      tree.some((n) => n.slug === 'agents-coding' || n.slug === 'agents-fetch' || n.slug === 'agents-generate'),
      false,
    )
    const coding = loadPage('agents-coding')
    assert.equal(coding?.parent, 'page:agents')
    const codingNode = agents.children.find((c) => c.slug === 'agents-coding')
    assert.deepEqual(
      codingNode?.children.map((c) => c.slug),
      ['agents-coding-generate', 'agents-coding-debug'],
    )
    assert.equal(loadPage('overview')?.highlight, 'start')
    assert.equal(loadPage('implement')?.highlight, 'queue')
    assert.equal(loadPage('sandbox')?.highlight, 'lab')
    assert.equal(bootTree[0]?.slug, 'overview')
    assert.equal(bootTree[1]?.slug, 'sandbox')
    const sandboxNest = bootTree.find((n) => n.slug === 'sandbox')
    assert.ok(sandboxNest)
    assert.equal(sandboxNest.highlight, 'lab')
    const nestSlugs = sandboxNest.children.map((c) => c.slug).sort()
    assert.deepEqual(nestSlugs, ['sandbox-fork-bins'])
    assert.equal(loadPage('future')?.parent, 'page:docs-home')
    assert.equal(loadPage('future')?.sandbox, false)
    assert.equal(loadPage('future')?.bin, 'doc')
    assert.equal(loadPage('future')?.depth, 'long')
    assert.equal(loadPage('sandbox-how-the-lab-works')?.sandbox, false)
    assert.equal(loadPage('sandbox-how-the-lab-works')?.bin, 'doc')
    assert.equal(loadPage('sandbox-memory'), null)
    assert.equal(loadPage('sandbox-idea'), null)
    assert.equal(tree.some((n) => n.slug === 'sandbox-idea' || n.slug === 'sandbox-code'), false)
    assert.equal(tree.some((n) => n.slug === 'workbench' || String(n.slug).startsWith('workbench-')), false)
    assert.equal(loadPage('workbench'), null)
    assert.equal(loadPage('workbench-sandbox'), null)
    const impl = bootTree.find((n) => n.slug === 'implement')
    assert.ok(impl)
    assert.equal(loadPage('implement')?.parent, '')
    assert.match(loadPage('control')?.body ?? '', /To-implement/)
    assert.equal(bootTree.some((n) => String(n.slug).startsWith('sandbox-')), false)
    assert.equal(loadPage('future')?.project, 'framework')
  })
})

describe('sandbox trash and project graph', () => {
  it('hides a trashed lab page from the live nest and restores it', () => {
    const slug = 'sandbox-fork-bins'
    putSandboxTrash({ slug, id: 'page:sandbox-fork-bins', title: 'Fork bins' })
    assert.equal(trashState(slug), 'trashed')
    const nest = pageTree(listPages()).find((n) => n.slug === 'sandbox')
    assert.equal(nest?.children.some((c) => c.slug === slug), false)
    restoreSandboxTrash(slug)
    assert.equal(trashState(slug), 'live')
    const again = pageTree(listPages()).find((n) => n.slug === 'sandbox')
    assert.ok(again?.children.some((c) => c.slug === slug))
  })

  it('filters the wiki graph by project and keeps explicit edges', () => {
    const scoped = filterGraphByProject(buildKnowledgeGraph(), 'framework')
    assert.ok(scoped.nodes.some((n) => n.id === 'page:future' || n.id === 'page:sandbox'))
    assert.ok(scoped.count.nodes >= 1)
  })
})

describe('cite-or-fetch', () => {
  it('parses arXiv and [@id] names', () => {
    assert.deepEqual(namedRefs('see [@hm-rag-2025] and arxiv:2407.01449'), ['2407.01449', 'hm-rag-2025'])
  })

  it('flags claims with no token overlap and cites supporting hits', () => {
    const hits = [
      {
        chunk_id: 'chunk:lp',
        doc_id: 'living-papers-heer-2023',
        title: 'Living Papers',
        text: 'Markdown is the source of the scholarly site compile pipeline.',
        score: 1,
        ground: 'papers',
      },
    ]
    const g = groundClaims(
      'Markdown is the source of the scholarly site. Unicorns invented reciprocal rank fusion in seventeen ninety nine.',
      hits,
    )
    assert.ok(g.cited.some((c) => c.id === 'chunk:lp'))
    assert.ok(g.unsupported.some((s) => /unicorns/i.test(s)))
  })

  it('hints fetch when a named paper is missing', () => {
    const hint = notInDbHint('please get arxiv 9999.99999', [])
    assert.match(hint ?? '', /Not in DB/)
    assert.match(hint ?? '', /papers\/fetch/)
  })

  it('exposes the mustCite contract', () => {
    const env = citeOrFetchEnvelope([], 'hello')
    assert.equal(env.mustCite, true)
    assert.equal(env.fetch, 'POST /api/papers/fetch')
    assert.deepEqual(env.hits, [])
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
    assert.ok(ids.includes('papers-db'))
    assert.ok(ids.includes('maps-fetch'))
    assert.ok(ids.includes('memory'))
    assert.ok(ids.includes('meta'))
    assert.ok(ids.includes('meta-one'))
    assert.ok(ids.includes('boards'))
    assert.ok(ids.includes('boards-create'))
    assert.ok(ids.includes('boards-current'))
    assert.ok(ids.includes('boards-pending'))
    assert.ok(ids.includes('boards-heartbeat'))
    assert.ok(ids.includes('graph'))
    assert.ok(ids.includes('graph-neighborhood'))
    assert.ok(ids.includes('generate-seed'))
    assert.ok(ids.includes('tripwires'))
    assert.ok(ids.includes('implement'))
    assert.ok(ids.includes('implement-add'))
    assert.ok(ids.includes('implement-complete'))
    assert.ok(ids.includes('sandbox-flags'))
    assert.ok(ids.includes('sandbox-flag'))
    assert.ok(ids.includes('condensed'))
    assert.ok(ids.includes('condensed-record'))
  })

  it('overview joins pages and papers', () => {
    const ov = siteOverview()
    assert.ok(ov.pages.some((p) => p.slug === 'tutorial'))
    assert.equal(ov.pages.some((p) => p.slug === 'control'), false)
    assert.equal(ov.bin, 'boot')
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
    assert.equal(isBlockedIp('100.107.135.79'), true)
    assert.equal(isBlockedIp('8.8.8.8'), false)
    assert.throws(() => parseHttpUrl('http://127.0.0.1/secret'), /blocked host/)
    assert.throws(() => parseHttpUrl('http://localhost:5175/api'), /blocked host/)
    assert.throws(() => parseHttpUrl('http://169.254.169.254/latest/meta-data'), /blocked host/)
    assert.throws(() => parseHttpUrl('file:///etc/passwd'), /only http/)
  })
})

describe('permanent paper DB', () => {
  it('summarizes ingested papers and marks them permanent', () => {
    const db = loadPaperDb()
    assert.equal(db.permanent, true)
    assert.ok(db.papers.length >= 18)
    const lp = db.papers.find((p) => p.id === 'living-papers-heer-2023')
    assert.ok(lp?.summary)
    assert.ok(lp?.executedIn.some((e) => e.path.includes('pages.ts')))
    assert.equal(lp?.permanent, true)
  })
})

describe('forgetting memory', () => {
  it('decays unused items and lists project seeds', () => {
    const old = {
      id: 't',
      lane: 'user' as const,
      text: 'x',
      kind: 'note',
      createdAt: '2020-01-01T00:00:00.000Z',
      lastAccessAt: '2020-01-01T00:00:00.000Z',
      strength: 1,
      halfLifeHours: 24,
    }
    assert.ok(decayedStrength(old, Date.parse('2020-01-10T00:00:00.000Z')) < 0.01)
    const listed = listMemory('project')
    assert.ok(listed.items.some((i) => i.id === 'proj-paper-db-permanent'))
    const added = remember({ lane: 'user', text: 'test memory from scholar.test', kind: 'test', halfLifeHours: 72 })
    assert.equal(added.forgotten, false)
    assert.match(added.text, /test memory/)
    const correction = remember({
      lane: 'user',
      text: 'corrected: scholar.test supersedes the prior note',
      kind: 'test',
      supersedes: added.id,
    })
    assert.equal(correction.supersedes, added.id)
    const hidden = listMemory('user')
    assert.ok(!hidden.items.some((i) => i.id === added.id))
    assert.ok(hidden.items.some((i) => i.id === correction.id && i.supersedes === added.id))
    const archive = listMemory('user', false, true)
    const replaced = archive.items.find((i) => i.id === added.id)
    assert.equal(replaced?.superseded, true)
    assert.equal(replaced?.supersededBy, correction.id)
    const forgotten = forgetMemory(correction.id, 'scholar.test AUDIT')
    assert.ok(forgotten?.forgotten)
    const audit = readBookkeep(80).find((e) => e.kind === 'AUDIT' && (e.detail as { what?: string }).what === correction.id)
    assert.ok(audit)
    assert.equal((audit?.detail as { why?: string }).why, 'scholar.test AUDIT')
  })
})

describe('diagrams', () => {
  it('normalizes tuple, from/to, and source/target edges', () => {
    const edges = asEdges([
      ['papers', 'hybrid'],
      { from: 'md', to: 'vdb' },
      { source: 'L-mlp', target: 'L-loss', kind: 'data' },
      { from: 'vdb', to: 'md', kind: 'feedback', direction: 'backward', label: 'loop' },
    ])
    assert.equal(edges.length, 4)
    assert.equal(edges[2]?.from, 'L-mlp')
    assert.equal(edges[2]?.to, 'L-loss')
    assert.equal(edges[3]?.kind, 'feedback')
    assert.equal(edges[3]?.direction, 'backward')
  })

  it('loads the hybrid loop and RSNN graph with edges', () => {
    const graphs = loadAllDiagrams()
    const loop = graphs.find((g) => g.id === 'hybrid-rag-loop')
    const rsnn = graphs.find((g) => g.id === 'rsnn-mlp')
    assert.ok(loop && loop.nodes.length >= 10 && loop.edges.length >= 10)
    assert.ok(rsnn && rsnn.edges.some((e) => e.from === 'L-onehot' && e.to === 'L-mlp'))
    assert.ok(loop?.edges.some((e) => e.from === 'vdb' && e.to === 'md' && e.kind === 'feedback'))
    assert.ok(rsnn?.edges.some((e) => e.kind === 'feedback' && e.from === 'R-sf-a' && e.to === 'R-rsnn-a'))
    assert.ok(rsnn?.edges.some((e) => e.kind === 'stop-grad'))
    const payload = diagramsPayload()
    assert.ok(payload.graphs.length >= 2)
    const hybrid = loop?.nodes.find((n) => n.id === 'hybrid')
    assert.equal(hybrid?.meta?.pageId, 'page:hybrid-rag')
    assert.ok(hybrid?.meta?.paperIds?.includes('colpali-2024'))
    assert.ok(hybrid?.meta?.paperIds?.includes('living-papers-heer-2023'))
    const regions = loop?.regions ?? loop?.blankets ?? []
    assert.deepEqual(
      regions.map((b) => b.id).sort(),
      ['ipad', 'local-pc', 'website'],
    )
    assert.ok(regions.find((b) => b.id === 'ipad')?.nodeIds.includes('scribble'))
    assert.ok(regions.find((b) => b.id === 'website')?.nodeIds.includes('site'))
    assert.ok(regions.find((b) => b.id === 'website')?.nodeIds.includes('wiki'))
    assert.ok(regions.find((b) => b.id === 'website')?.nodeIds.includes('vis'))
    assert.ok(regions.find((b) => b.id === 'local-pc')?.nodeIds.includes('hybrid'))
    const claimed = new Set(regions.flatMap((r) => r.nodeIds))
    assert.ok(loop!.nodes.every((n) => claimed.has(n.id)))
    assert.equal((rsnn?.regions ?? rsnn?.blankets ?? []).length, 0)
    const refs = collectDiagramPaperRefs(loop!)
    assert.ok(refs.some((r) => r.value === 'colpali-2024' || r.value.includes('colpali')))
  })

  it('assigns every hybrid-loop node to iPad, local PC, or website', () => {
    const inferred = resolveRegions({
      id: 'hybrid-rag-loop',
      nodes: [
        { id: 'scribble', label: 'Scribbling (iPad)', group: 'in' },
        { id: 'inbox', label: 'inbox park', group: 'in' },
        { id: 'vdb', label: 'vector DB', group: 'store' },
        { id: 'wiki', label: 'Wikipedia UI', group: 'site' },
        { id: 'vis', label: '3b1b visual', group: 'site' },
        { id: 'notes', label: 'cursor notes', group: 'in' },
      ],
    })
    assert.deepEqual(
      inferred.map((r) => r.id).sort(),
      ['ipad', 'local-pc', 'website'],
    )
    assert.ok(inferred.find((r) => r.id === 'ipad')?.nodeIds.includes('scribble'))
    assert.ok(inferred.find((r) => r.id === 'ipad')?.nodeIds.includes('inbox'))
    assert.ok(inferred.find((r) => r.id === 'local-pc')?.nodeIds.includes('vdb'))
    assert.ok(inferred.find((r) => r.id === 'local-pc')?.nodeIds.includes('notes'))
    assert.ok(inferred.find((r) => r.id === 'website')?.nodeIds.includes('wiki'))
    assert.ok(inferred.find((r) => r.id === 'website')?.nodeIds.includes('vis'))
    const claimed = new Set(inferred.flatMap((r) => r.nodeIds))
    assert.ok(['scribble', 'inbox', 'vdb', 'wiki', 'vis', 'notes'].every((id) => claimed.has(id)))

    const user = resolveRegions({
      id: 'hybrid-rag-loop',
      nodes: [
        { id: 'scribble', label: 'Scribbling (iPad)', group: 'in' },
        { id: 'vdb', label: 'vector DB', group: 'store' },
      ],
      regions: [{ id: 'ipad', label: 'iPad', nodeIds: ['vdb'], source: 'user' }],
    })
    assert.deepEqual(user.find((r) => r.id === 'ipad')?.nodeIds, ['vdb', 'scribble'])
    assert.equal(user.find((r) => r.id === 'ipad')?.source, 'user')
    assert.equal(user.find((r) => r.id === 'local-pc')?.nodeIds.includes('vdb'), false)
  })

  it('does not attach the three-way split to RSNN', () => {
    const rsnn = resolveRegions({
      id: 'rsnn-mlp',
      nodes: [
        { id: 'L-mlp', label: 'MLP', group: 'model' },
        { id: 'scribble', label: 'Scribbling (iPad)', group: 'in' },
      ],
    })
    assert.equal(rsnn.length, 0)
  })
})

describe('metadata bus', () => {
  it('indexes pages, papers, and diagram nodes with shared ids', () => {
    const ids = listMeta().map((r) => r.id)
    assert.ok(ids.includes('page:hybrid-rag'))
    assert.ok(ids.includes('living-papers-heer-2023'))
    assert.ok(ids.includes('node:hybrid-rag-loop:hybrid'))
    assert.ok(ids.includes('module:search'))
    const hybrid = loadMeta('node:hybrid-rag-loop:hybrid')
    assert.ok(hybrid)
    assert.equal(hybrid.type, 'node')
    assert.match(hybrid.summary.long, /isolated/i)
    assert.ok(hybrid.paperIds?.includes('colpali-2024'))
    assert.equal(hybrid.href, '/docs/diagrams#hybrid')
    const filtered = filterMeta({ type: 'page', q: 'hybrid rag' })
    assert.ok(filtered.records.some((r) => r.id === 'page:hybrid-rag'))
    const hybridPage = loadMeta('page:hybrid-rag')
    assert.ok(hybridPage)
    assert.equal(hybridPage.href, '/docs/hybrid-rag')
    assert.equal(hybridPage.nest, 'encyclopedia')
    assert.ok(typeof hybridPage.graphDegree === 'number')
    const labChild = loadMeta('page:sandbox-fork-bins')
    assert.ok(labChild)
    assert.equal(labChild.nest, 'sandbox')
    assert.equal(labChild.parent, 'page:sandbox')
    assert.equal(labChild.sandbox, true)
    assert.ok(labChild.href)
    const nestFilter = filterMeta({ nest: 'sandbox', type: 'page' })
    assert.ok(nestFilter.records.every((r) => r.nest === 'sandbox'))
    assert.ok(nestFilter.records.some((r) => r.id === 'page:sandbox-fork-bins'))
    const parentFilter = filterMeta({ parent: 'page:sandbox', type: 'page' })
    assert.ok(parentFilter.records.some((r) => r.id === 'page:sandbox'))
    assert.ok(parentFilter.records.some((r) => r.parent === 'page:sandbox'))
  })

  it('indexes @chunk code records on the same bus', () => {
    const code = filterMeta({ type: 'code' })
    assert.ok(code.records.every((r) => r.type === 'code'))
    assert.ok(code.records.some((r) => r.id === 'code:loop.hybrid_search'))
    assert.ok(code.records.some((r) => r.id === 'code:loop.tokenize'))
    const rec = loadMeta('code:loop.hybrid_search')
    assert.ok(rec)
    assert.equal(rec.type, 'code')
    assert.ok(rec.implements?.includes('page:hybrid-rag'))
    assert.ok(rec.citations.includes('hm-rag-2025'))
  })

  it('creates a tied board on the bus with required link fields', () => {
    const board = createTiedBoard({ sourceType: 'page', sourceId: 'page:overview' })
    assert.equal(board.type, 'board')
    assert.ok(board.id.startsWith('board:'))
    assert.ok(board.boardKey.startsWith('ipad-tied-'))
    assert.equal(board.pageId, 'page:overview')
    assert.equal(board.sourceSlug, 'overview')
    assert.match(board.padHref, /board=/)
    assert.equal(pendingTiedBoard().id, board.id)
    touchPadHeartbeat()
    assert.equal(padPresence().online, true)
    assert.equal(board.surface, 'clean')
    assert.equal(board.assets.length, 0)
    const stamped = createTiedBoard({ sourceType: 'page', sourceId: 'page:overview', surface: 'stamped' })
    assert.equal(stamped.surface, 'stamped')
    assert.notEqual(stamped.boardKey, board.boardKey)
    assert.notEqual(stamped.persistenceKey, board.persistenceKey)
    assert.ok(stamped.assets.length >= 1)
    assert.ok(stamped.assetPath)
    const diagram = createTiedBoard({ sourceType: 'diagram', sourceId: 'diagram:hybrid-rag-loop', surface: 'stamped' })
    assert.equal(diagram.surface, 'stamped')
    assert.ok(diagram.assets.some((a) => a.kind === 'image'))
    assert.ok(diagram.assetPath)
    const pixel =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    const jpeg =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wAAAA=='
    const captured = createTiedBoard({
      sourceType: 'diagram',
      sourceId: 'diagram:hybrid-rag-loop',
      surface: 'stamped',
      imageBase64: pixel,
      w: 1,
      h: 1,
    })
    assert.ok(captured.assets.some((a) => a.file.endsWith('.png')))
    const jpegBoard = createTiedBoard({
      sourceType: 'diagram',
      sourceId: 'diagram:hybrid-rag-loop',
      surface: 'stamped',
      imageBase64: jpeg,
      w: 8,
      h: 8,
    })
    assert.ok(jpegBoard.assets.some((a) => a.file.endsWith('.jpg') && a.mime === 'image/jpeg'))
    assert.ok(!jpegBoard.assets.some((a) => a.file.endsWith('.svg')))
    const paperIgnore = createTiedBoard({
      sourceType: 'paper',
      sourceId: 'dashboard-design-patterns-2022',
      surface: 'stamped',
      imageBase64: pixel,
    })
    assert.equal(paperIgnore.surface, 'stamped')
    assert.ok(paperIgnore.assets.length >= 1)
    const rec = loadMeta(board.id)
    assert.ok(rec)
    assert.equal(rec.type, 'board')
    assert.equal(rec.boardKey, board.boardKey)
    assert.ok(filterMeta({ type: 'board' }).records.some((r) => r.id === board.id))
    const inbox = mergeParkMeta({ savedAt: 't', parked: true, bytes: 1, hasPng: false, liveWrite: false }, {
      boardId: board.id,
      pageId: board.pageId,
      paperIds: board.paperIds,
      sourceType: board.sourceType,
      sourceId: board.sourceId,
      sourceSlug: board.sourceSlug,
      boardKey: board.boardKey,
    })
    assert.equal(inbox.boardId, board.id)
    assert.equal(inbox.liveWrite, false)
    const stampBoard = { id: stamped.id, surface: 'stamped', boardKey: stamped.boardKey, persistenceKey: stamped.persistenceKey }
    assert.equal(canStampBoard({ boardId: stamped.id, activeBoardId: stamped.id, persistenceKey: stamped.boardKey }, stampBoard), true)
    assert.equal(canStampBoard({ boardId: stamped.id, activeBoardId: 'whiteboard', persistenceKey: 'ipad-cursor-canvas' }, stampBoard), false)
    assert.equal(canStampBoard({ boardId: stamped.id, activeBoardId: stamped.id, persistenceKey: 'ipad-cursor-canvas' }, stampBoard), false)
    assert.equal(canStampBoard({ boardId: stamped.id, activeBoardId: stamped.id }, { ...stampBoard, surface: 'clean' }), false)
  })
})

describe('code maps', () => {
  it('curates paper-to-code edges', () => {
    const maps = loadMaps()
    assert.ok(maps.count > 10)
    assert.ok(maps.edges.some((e) => e.from.id === 'living-papers-heer-2023' && e.to.id.includes('pages.ts')))
  })
})

describe('wiki knowledge graph', () => {
  it('only emits edges between existing meta ids', () => {
    const g = buildKnowledgeGraph()
    const ids = new Set(g.nodes.map((n) => n.id))
    assert.ok(g.nodes.some((n) => n.id === 'page:hybrid-rag'))
    assert.ok(g.nodes.some((n) => n.id === 'living-papers-heer-2023'))
    assert.ok(!g.nodes.some((n) => n.type === 'board'))
    for (const e of g.edges) {
      assert.ok(ids.has(e.from), `missing from ${e.from}`)
      assert.ok(ids.has(e.to), `missing to ${e.to}`)
    }
    const page = g.nodes.find((n) => n.id === 'page:hybrid-rag')
    assert.ok(page)
    assert.ok(g.edges.some((e) => e.from === 'page:hybrid-rag' && e.to === 'living-papers-heer-2023'))
  })

  it('neighborhood is a filter of the same graph', () => {
    const g = buildKnowledgeGraph()
    const hood = graphNeighborhood('page:hybrid-rag', 1)
    assert.equal(hood.id, 'wiki-knowledge-graph')
    assert.equal(hood.missing, false)
    assert.equal(hood.focus, 'page:hybrid-rag')
    const all = new Set(g.nodes.map((n) => n.id))
    for (const n of hood.nodes) assert.ok(all.has(n.id))
    assert.equal(resolveGraphId('hybrid-rag'), 'page:hybrid-rag')
    const miss = graphNeighborhood('page:does-not-exist-xyz', 1)
    assert.equal(miss.missing, true)
    assert.equal(miss.nodes.length, 0)
  })
})

describe('generate seed', () => {
  it('returns an in-DB paper and rejects invented ids', () => {
    const seed = generateSeed()
    assert.equal(seed.ok, true)
    if (seed.ok) {
      assert.ok(loadPaperDb().papers.some((p) => p.id === seed.paperId))
      assert.ok(seed.gist.length > 0)
    }
    const miss = generateSeed('not-a-real-paper-zzz')
    assert.equal(miss.ok, false)
    assert.match(miss.error ?? '', /Not in DB/)
  })
})

describe('tripwires', () => {
  it('keeps MGM disarmed until an explicit hire phrase', () => {
    const t = tripwires()
    assert.equal(t.mgm.implemented, true)
    assert.equal(t.mgm.armed, false)
    assert.equal(t.mgm.userStartsCall, true)
    assert.equal(t.mgm.askUserBeforeSuggesting, true)
    assert.equal(t.mgm.never, 'production')
    assert.equal(t.sandbox.implemented, true)
    assert.equal(t.sandbox.requireDocker, false)
    assert.match(t.mgm.hireOnlyIf, /hire MGM/)
    assert.match(t.sandbox.policy, /[Ff]ork/)
    assert.equal(isHirePhrase('please enable mgm quietly'), false)
    assert.equal(isHirePhrase('hire MGM'), true)
    assert.throws(() => hireMgm('turn it on'), /hire MGM/)
  })
})

describe('implement queue', () => {
  it('hides completed seeds including abandoned TraceCoder', () => {
    const active = listImplement(false)
    assert.equal(active.items.some((i) => i.id === 'impl-tracecoder-understand'), false)
    assert.equal(active.items.some((i) => i.id === 'impl-mgm-ondemand'), false)
    assert.equal(active.items.some((i) => i.id === 'impl-sandbox-fork-lab'), false)
    assert.equal(active.items.some((i) => i.id === 'impl-sandbox-site-lanes'), false)
    assert.ok(active.items.some((i) => i.id === 'impl-sandbox-git-merge' && i.status === 'discuss'))
    assert.ok(active.items.some((i) => i.id === 'impl-context-editing' && i.status === 'discuss'))
    assert.equal(
      active.items.some((i) => /clawvm/i.test(i.title) || /clawvm/i.test(i.id)),
      false,
    )
    assert.equal(active.never, 'production')
    const archived = listImplement(true)
    assert.ok(archived.items.some((i) => i.id === 'impl-tracecoder-understand' && i.status === 'implemented'))
    assert.ok(archived.items.some((i) => i.id === 'impl-sandbox-fork-lab' && i.status === 'implemented'))
    assert.ok(archived.items.some((i) => i.id === 'impl-mgm-ondemand' && i.status === 'implemented'))
    const added = addImplement({ title: 'test queue row', status: 'discuss', note: 'scholar test' })
    completeImplement(added.id)
    const after = listImplement(false)
    assert.equal(after.items.some((i) => i.id === added.id), false)
    assert.ok(listImplement(true).items.some((i) => i.id === added.id && i.status === 'implemented'))
  })
})

describe('sandbox names', () => {
  it('sanitizes lab names', () => {
    assert.equal(sanitizeLabName('My Lab'), 'my-lab')
    assert.throws(() => sanitizeLabName('---'), /letters/)
  })
})

describe('condensed returns', () => {
  it('stores ids plus gist and refuses a transcript-only dump', () => {
    const before = listCondensedReturns().count
    const row = recordCondensedReturn({
      role: 'code',
      gist: 'Wired the packet contract. FadeMem stays an analog.',
      ids: ['page:future', 'arxiv-2601-18642'],
    })
    assert.equal(row.ok, true)
    assert.ok(row.recorded.ids.some((i) => i.id === 'page:future'))
    assert.match(row.recorded.gist, /packet/)
    assert.throws(() => recordCondensedReturn({ gist: 'no ids' }), /id/)
    assert.ok(listCondensedReturns().count >= before)
  })
})

describe('sandbox flags', () => {
  it('persists flag then unflag and stays off the implement queue', () => {
    const before = listSandboxFlags().slugs.includes('sandbox-fork-bins')
    const on = setSandboxFlag({ slug: 'sandbox-fork-bins', flagged: true, note: 'scholar test' })
    assert.equal(on.ok, true)
    assert.equal(on.flagged, true)
    assert.ok(listSandboxFlags().flags.some((f) => f.slug === 'sandbox-fork-bins' && f.flagged === true))
    const off = setSandboxFlag({ id: 'page:sandbox-fork-bins', flagged: false })
    assert.equal(off.flagged, false)
    assert.equal(listSandboxFlags().slugs.includes('sandbox-fork-bins'), false)
    if (before) setSandboxFlag({ slug: 'sandbox-fork-bins', flagged: true })
    assert.equal(listImplement(false).items.some((i) => i.id === 'sandbox-fork-bins'), false)
  })
})

describe('sandbox promote', () => {
  it('locks on the promote phrase and refuses existing dest', () => {
    assert.equal(isPromotePhrase('promote to main'), true)
    assert.equal(isPromotePhrase('merge it'), false)
    assert.equal(destSlugFor('sandbox-research-note'), 'research-note')
    assert.throws(() => promoteSandboxPage({ slug: 'sandbox-fork-bins', phrase: 'please' }), /promote to main/)
    assert.throws(
      () => promoteSandboxPage({ slug: 'sandbox-fork-bins', destSlug: 'overview', phrase: 'promote to main' }),
      /refuse dest/,
    )
  })
})
