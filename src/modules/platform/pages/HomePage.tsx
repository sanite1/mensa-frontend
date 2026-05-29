// Placeholder homepage. The real editorial hero ships in Sprint 5 (content
// layer). For now this is a clear gateway to the shop so customers landing
// on the home page have somewhere to go.
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/chrome/icons'

export function HomePage() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-16 md:py-24">
      <div className="t-eyebrow text-[var(--mute)] mb-4">Mensa Period Products</div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 'clamp(56px, 9vw, 124px)',
          lineHeight: 0.92,
          letterSpacing: '-0.035em',
          color: 'var(--ink)',
        }}
      >
        Switch once.
        <br />
        Wear for <span style={{ color: 'var(--pink)' }}>five years.</span>
      </h1>
      <p
        className="mt-6 max-w-[560px] text-[var(--graphite)]"
        style={{ fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.55 }}
      >
        Mensa makes reusable period products for Nigerian women. Comfortable, dignified, and made
        to last.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button asChild variant="primary" size="lg">
          <Link to="/shop">
            Shop the collection <IconArrowRight size={16} />
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link to="/shop/starter-set">See the starter set</Link>
        </Button>
      </div>
    </section>
  )
}
