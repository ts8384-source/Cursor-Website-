import { Link } from 'react-router-dom'
import type { PageTreeNode } from './types'
import { WikiPageTree } from './WikiPageTree'

export function OverviewStructure({ tree, slug }: { tree: PageTreeNode[]; slug: string }) {
  return (
    <section className="wiki-map" aria-labelledby="wiki-map-h">
      <h2 id="wiki-map-h">Page structure</h2>
      <p className="wiki-map-intro">
        Live wiki map from <code>GET /api/pages?bin=boot</code> or <code>?bin=doc</code> (child
        frontmatter <code>parent</code>). Hidden pages are omitted. The boot map is the user wiki.
        Framework explain pages do not appear here unless this is the doc site.
      </p>
      {tree.length ? <WikiPageTree tree={tree} slug={slug} variant="map" /> : <p>No visible pages.</p>}
      <p className="wiki-map-kg">
        Related ids and citations live on the <Link to="/docs/knowledge-graph">knowledge graph</Link> (doc wiki).
      </p>
    </section>
  )
}
