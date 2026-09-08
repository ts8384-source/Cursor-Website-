import { Fragment, type ReactNode } from 'react'
import { DiagramsBoard } from './DiagramsBoard'
import { ExecutionBoard } from './ExecutionBoard'
import { ImplementBoard } from './ImplementBoard'
import { JsxGraphPlot } from './JsxGraphPlot'
import { KnowledgeGraphBoard } from './KnowledgeGraphBoard'
import { MapsBoard } from './MapsBoard'
import { MathCompareLab } from './MathCompareLab'
import { MemoryBoard } from './MemoryBoard'
import { PaperCatalog } from './PaperCatalog'
import { SummariesBoard } from './SummariesBoard'
import { OverviewStructure } from './OverviewStructure'
import type { PageTreeNode, PaperRecord } from './types'

/**
 * Live widgets a page can mount, named in its `embeds:` frontmatter.
 *
 * This file owns the renderers. It must never own membership: which page gets which board is the
 * page's own metadata, so a fork adds a board by editing Markdown, not this registry. See
 * CONTROL.md → "Metadata is the index".
 */

export type EmbedContext = {
  slug: string
  tree: PageTreeNode[]
  papers: PaperRecord[]
  reloadPapers: () => void
}

/** `name:arg` — everything after the first colon is the argument, e.g. `diagrams:wiki-memory`. */
type Renderer = (arg: string, ctx: EmbedContext) => ReactNode

const JsxGraphLab = () => (
  <section className="jsxgraph-lab" aria-labelledby="jsxgraph-lab-title">
    <h2 id="jsxgraph-lab-title">JSXGraph prototype</h2>
    <p className="jsxgraph-lab-note">
      Framework text math is KaTeX. Use JSXGraph when you need an interactive plot (handbook 9:1).
    </p>
    <JsxGraphPlot />
  </section>
)

const REGISTRY: Record<string, Renderer> = {
  /** All diagrams, or only those whose id starts with the argument. */
  diagrams: (arg) => <DiagramsBoard onlyPrefix={arg || undefined} />,
  'diagrams-compact': () => <DiagramsBoard compact />,
  'page-structure': (_arg, ctx) => <OverviewStructure tree={ctx.tree} slug={ctx.slug} />,
  papers: (_arg, ctx) => <PaperCatalog papers={ctx.papers} onRefresh={ctx.reloadPapers} />,
  'implement-board': () => <ImplementBoard />,
  'knowledge-graph': () => <KnowledgeGraphBoard />,
  summaries: () => <SummariesBoard />,
  maps: () => <MapsBoard />,
  memory: () => <MemoryBoard />,
  execution: () => <ExecutionBoard />,
  'math-compare': () => <MathCompareLab />,
  jsxgraph: () => <JsxGraphLab />,
}

export const embedNames = () => Object.keys(REGISTRY)

const warned = new Set<string>()

/** Renders a page's declared embeds. An unknown name is skipped, never a crashed page. */
export function PageEmbeds({ names, ctx }: { names?: string[]; ctx: EmbedContext }) {
  if (!names?.length) return null
  return (
    <>
      {names.map((entry) => {
        const at = entry.indexOf(':')
        const key = at === -1 ? entry : entry.slice(0, at)
        const arg = at === -1 ? '' : entry.slice(at + 1)
        const render = REGISTRY[key.trim()]
        if (!render) {
          if (!warned.has(entry)) {
            warned.add(entry)
            console.warn(`[embeds] "${entry}" on /${ctx.slug} is not a known embed. Known: ${embedNames().join(', ')}`)
          }
          return null
        }
        return <Fragment key={entry}>{render(arg.trim(), ctx)}</Fragment>
      })}
    </>
  )
}
