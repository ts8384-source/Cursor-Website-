import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link } from 'react-router-dom'
import type { PageMeta } from './types'

type Props = {
  bin: 'boot' | 'doc'
  docsOn: boolean
  pages: PageMeta[]
}

const badgeFor = (highlight?: string) =>
  highlight === 'start' ? 'Start' : highlight === 'lab' ? 'Lab' : highlight === 'queue' ? 'Queue' : ''

function Item({ page }: { page: PageMeta }) {
  return (
    <DropdownMenu.Item asChild>
      <Link className="site-menu-dropdown-item" to={page.href || `/site/${page.slug}`}>
        {page.nav || page.title}
        {badgeFor(page.highlight) ? (
          <span className={`wiki-badge wiki-badge-${page.highlight}`}>{badgeFor(page.highlight)}</span>
        ) : null}
      </Link>
    </DropdownMenu.Item>
  )
}

/**
 * Two click menus. Overview and Lab bench are not repeated here — the crumb trail on the right of
 * the same bar already links both (handbook 7:2: one route to a destination, not two).
 * Both menus are non-modal, so the trigger toggles and the page still scrolls while one is open.
 */
export function SiteMenus({ bin, docsOn, pages }: Props) {
  const destinations = pages
    .filter((p) => ['summary', 'papers', 'implement'].includes(p.slug))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  const tutorial = pages.find((p) => p.slug === 'tutorial')
  const dives = pages.filter((p) => p.subpage && !p.hidden)
  const byId = new Map(pages.map((p) => [p.id || `page:${p.slug}`, p]))
  const diveGroups = [...new Map(dives.map((d) => [d.parent, [] as PageMeta[]])).keys()].map((parent) => ({
    parent,
    label: byId.get(parent ?? '')?.nav || byId.get(parent ?? '')?.title || 'Elsewhere',
    items: dives.filter((d) => d.parent === parent),
  }))

  return (
    <div className="site-menus">
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className="site-menu-more" aria-label="Go to another page">
          Go to
          <span aria-hidden="true"> ▾</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="site-menu-dropdown" sideOffset={6} align="start">
            {destinations.map((p) => (
              <Item key={p.slug} page={p} />
            ))}
            {tutorial || docsOn || bin === 'doc' ? (
              <>
                <DropdownMenu.Separator className="site-menu-sep" />
                <DropdownMenu.Label className="site-menu-label">Framework</DropdownMenu.Label>
                {tutorial ? <Item page={tutorial} /> : null}
                <DropdownMenu.Item asChild>
                  <Link
                    className="site-menu-dropdown-item"
                    to={`${bin === 'doc' ? '/docs' : '/site'}/papers#shelf-framework`}
                  >
                    Framework papers
                  </Link>
                </DropdownMenu.Item>
                {docsOn || bin === 'doc' ? (
                  <DropdownMenu.Item asChild>
                    <Link className="site-menu-dropdown-item" to="/docs/docs-home">
                      Framework docs
                    </Link>
                  </DropdownMenu.Item>
                ) : null}
                {bin === 'doc' ? (
                  <DropdownMenu.Item asChild>
                    <Link className="site-menu-dropdown-item" to="/site/overview">
                      Back to the wiki
                    </Link>
                  </DropdownMenu.Item>
                ) : null}
              </>
            ) : null}
            <DropdownMenu.Arrow className="site-menu-arrow" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {dives.length ? (
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger className="site-menu-more" aria-label="Deep dives">
            Deep dives
            <span aria-hidden="true"> ▾</span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="site-menu-dropdown" sideOffset={6} align="start">
              {diveGroups.map((g, i) => (
                <div key={g.parent || `g${i}`}>
                  {i ? <DropdownMenu.Separator className="site-menu-sep" /> : null}
                  <DropdownMenu.Label className="site-menu-label">{g.label}</DropdownMenu.Label>
                  {g.items.map((p) => (
                    <Item key={p.slug} page={p} />
                  ))}
                </div>
              ))}
              <DropdownMenu.Arrow className="site-menu-arrow" />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : null}
    </div>
  )
}
