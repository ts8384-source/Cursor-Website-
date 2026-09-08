import * as Collapsible from '@radix-ui/react-collapsible'
import { useState, type ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

/** Radix collapsible for left/right rails. Keeps labeled toggle (handbook 9:1, 7:2). */
export function SiteRailFold({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible.Root className="rail-fold radix-rail" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="rail-fold-trigger" aria-expanded={open}>
        <span>{title}</span>
        <span className="rail-fold-caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content className="rail-fold-panel">{children}</Collapsible.Content>
    </Collapsible.Root>
  )
}
