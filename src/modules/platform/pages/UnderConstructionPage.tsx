// Shown on the bare production domain while the catalogue and journal are
// being prepared. The real storefront lives on app.mensaproducts.com until
// launch, then getModule() routes the apex back to the storefront.
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { MensaWordmark } from '@/components/chrome/MensaWordmark'
import { IconInstagram, IconTikTok } from '@/components/chrome/icons'
import { useSubscribeToNewsletter } from '@/lib/network/api/newsletter.api'
import { useSeo } from '@/lib/seo'

export function UnderConstructionPage() {
  useSeo({
    title: 'Coming soon',
    description:
      'Mensa Period Products is almost ready. Reusable period care, education and advocacy, designed for the modern woman.',
    noindex: true,
  })

  const subscribe = useSubscribeToNewsletter()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    subscribe.mutate(
      { email: trimmed, source: 'footer' },
      {
        onSuccess: () => {
          setDone(true)
          setEmail('')
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="px-6 md:px-12 py-6">
        <MensaWordmark height={30} />
      </header>

      <main className="flex-1 flex items-center px-6 md:px-12">
        <div className="max-w-190 mx-auto w-full text-center">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase font-medium text-coral">
            Something good is coming
          </div>
          <h1 className="mt-5 m-0 font-display italic font-semibold text-[clamp(40px,7vw,96px)] leading-[0.98] tracking-tight text-ink">
            Your one-stop
            <br />
            <span className="text-pink">menstrual health</span> shop.
          </h1>
          <p className="mt-6 mx-auto max-w-130 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            We are putting the finishing touches on Mensa. Reusable period care, fun menstrual
            health education, and fashionable advocacy that puts women and girls first. Leave your
            email and be the first to know when we open.
          </p>

          {done ? (
            <p className="mt-8 text-[15px] font-medium text-ink">
              You are on the list. See you soon.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 mx-auto flex max-w-110 items-stretch gap-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="h-12 flex-1 min-w-0 border border-hairline border-r-0 bg-paper px-4 text-base md:text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
              />
              <Button type="submit" variant="primary" size="lg" disabled={subscribe.isPending}>
                {subscribe.isPending ? 'Joining…' : 'Notify me'}
              </Button>
            </form>
          )}
        </div>
      </main>

      <footer className="px-6 md:px-12 py-8 flex flex-wrap items-center justify-between gap-4 border-t border-hairline-soft">
        <span className="text-[13px] text-mute">
          © 2026 Mensa Period Products · hi@mensaproducts.com
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/shopmensa_"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink hover:bg-cream"
          >
            <IconInstagram size={15} />
          </a>
          <a
            href="https://www.tiktok.com/@shopmensa"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink hover:bg-cream"
          >
            <IconTikTok size={15} />
          </a>
        </div>
      </footer>
    </div>
  )
}
