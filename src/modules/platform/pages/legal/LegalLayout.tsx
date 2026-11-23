// LegalLayout: shared shell for /privacy and /terms, in the design system's
// InfoPage layout. Our extra: an "On this page" list above the help card.

import type { ReactNode } from 'react'
import { HelpCard, InfoPage } from '@/components/design/InfoPage'

export interface LegalSection {
  heading: string
  /** ReactNode so individual sections can drop in links / lists. */
  body: ReactNode
}

interface LegalLayoutProps {
  eyebrow: string
  title: string
  lastUpdated: string
  intro: ReactNode
  sections: LegalSection[]
}

export function LegalLayout({ eyebrow, title, lastUpdated, intro, sections }: LegalLayoutProps) {
  return (
    <InfoPage
      eyebrow={eyebrow}
      title={title}
      lede={intro}
      updated={
        lastUpdated === 'Draft' ? 'Draft, pending legal review' : `Last updated ${lastUpdated}`
      }
      aside={
        <div className="grid gap-6">
          <nav aria-label="On this page">
            <span className="eyebrow">On this page</span>
            <ol className="mt-3 grid gap-2 text-(length:--fs-sm)">
              {sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${slugify(s.heading)}`} className="text-(--mute) hover:text-(--ink)">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <HelpCard />
        </div>
      }
    >
      {sections.map((s) => (
        <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-24 space-y-4">
          <h2>{s.heading}</h2>
          {s.body}
        </section>
      ))}
    </InfoPage>
  )
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
