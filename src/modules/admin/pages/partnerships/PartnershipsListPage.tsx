// /partnerships (admin) — top-level partnerships hub.

import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

import { OrganisationsTab } from './tabs/OrganisationsTab'
import { IndividualsTab } from './tabs/IndividualsTab'
import { PayoutsTab } from './tabs/PayoutsTab'

type Tab = 'organisations' | 'individuals' | 'payouts'

const TABS: { id: Tab; label: string }[] = [
  { id: 'organisations', label: 'Organisations' },
  { id: 'individuals', label: 'Individuals' },
  { id: 'payouts', label: 'Payouts' },
]

export function PartnershipsListPage() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: Tab = raw === 'individuals' || raw === 'payouts' ? raw : 'organisations'

  const setTab = (next: Tab) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next === 'organisations') p.delete('tab')
        else p.set('tab', next)
        return p
      },
      { replace: true },
    )
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="mb-6 md:mb-8">
        <div className="t-eyebrow text-mute mb-3">B2B</div>
        <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
          Partnerships
        </h1>
        <p className="t-body-s mt-2 text-graphite max-w-180">
          Organisations apply to work with Mensa at B2B pricing. Individuals apply to earn a
          commission for orders placed through their referral link. Payouts are settled manually.
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="mb-6 inline-flex border border-hairline bg-paper">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2.5 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
              tab === t.id ? 'bg-ink text-paper' : 'text-graphite hover:bg-cream-soft',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'organisations' ? <OrganisationsTab /> : null}
      {tab === 'individuals' ? <IndividualsTab /> : null}
      {tab === 'payouts' ? <PayoutsTab /> : null}
    </section>
  )
}
