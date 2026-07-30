// LegalLayout, shared shell for /privacy and /terms, includes a draft notice pending counsel review.

import type { ReactNode } from 'react'
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'

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

export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalLayoutProps) {
  return (
    <div className="bg-paper">
      <section className="bg-paper">
        <div className="px-5 md:px-10 lg:px-16 pt-10 lg:pt-16 pb-3 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 text-coral">
            <span aria-hidden className="w-7 h-px bg-current opacity-60" />
            <span className="font-mono text-[11px] tracking-widest uppercase font-medium">
              {eyebrow}
            </span>
          </div>
          <span className="font-mono text-[10.5px] tracking-widest uppercase text-mute">
            Last updated · {lastUpdated}
          </span>
        </div>

        <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
          <h1 className="m-0 font-display italic font-semibold text-[clamp(40px,7vw,112px)] leading-[0.95] tracking-tighter text-ink">
            {title}
          </h1>
          <div className="mt-8 lg:mt-12 pt-5 border-t border-hairline max-w-160 t-body-l text-graphite leading-relaxed">
            {intro}
          </div>

          {/* Draft notice — final copy needs legal review. Remove once
              counsel has signed off. */}
          <div className="mt-8 inline-flex items-start gap-3 max-w-160 px-4 py-3 border border-coral/40 bg-blush text-berry text-[13px] leading-relaxed">
            <span aria-hidden className="text-[14px]">⚠</span>
            <p className="m-0">
              <span className="font-medium">Working draft.</span> This copy describes how Mensa
              actually operates today. Please have your legal advisor review before relying on
              it as a formal agreement.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 lg:px-16 py-16 lg:py-24 bg-cream">
        <div className="max-w-180 mx-auto">
          {/* Mini table of contents */}
          <nav aria-label="On this page" className="mb-12">
            <SectionEyebrow color="var(--berry)">On this page</SectionEyebrow>
            <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 list-none m-0 p-0">
              {sections.map((s, i) => (
                <li key={s.heading}>
                  <a
                    href={`#${slugify(s.heading)}`}
                    className="block text-[14px] text-ink hover:text-pink-deep no-underline border-b border-hairline pb-1.5"
                  >
                    <span className="font-mono text-mute mr-2 text-[12px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-12 lg:gap-16">
            {sections.map((s, i) => (
              <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-24">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-[12px] uppercase tracking-widest text-mute">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="m-0 font-display italic font-semibold text-[clamp(24px,3vw,36px)] leading-tight tracking-tight text-ink">
                    {s.heading}
                  </h2>
                </div>
                <div className="t-body text-graphite leading-relaxed flex flex-col gap-4">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
