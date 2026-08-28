// Gallery — responsive PDP image gallery. Auto advances every 5s, pauses after any manual pick or swipe.
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/lib/network/types/product.types'
import { Photo } from './Photo'

type SlideTone = 'blush' | 'stripe' | 'cream' | 'pink' | 'ink'

interface Slide {
  key: string
  src?: string
  alt: string
  tone: SlideTone
  label?: string
}

interface GalleryProps {
  images: ProductImage[]
  productName: string
  badge?: { label: string; tone?: 'pink' | 'coral' | 'ink' } | null
}

// Badge tone maps to a Tailwind class so the gallery stays inline-style-free.
const BADGE_TONE_CLASS: Record<string, string> = {
  pink: 'bg-pink',
  coral: 'bg-coral',
  ink: 'bg-ink',
}

// Placeholder slides for products with no Cloudinary images, varied tones so the PDP does not read as broken.
const PLACEHOLDER_SLIDES: Slide[] = [
  { key: 'placeholder-hero', alt: '', tone: 'blush', label: 'hero' },
  { key: 'placeholder-flat', alt: '', tone: 'blush', label: 'flat' },
  { key: 'placeholder-detail', alt: '', tone: 'stripe', label: 'detail' },
  { key: 'placeholder-pack', alt: '', tone: 'cream', label: 'pack' },
]

const AUTO_ADVANCE_MS = 5000
// After a manual pick or swipe, hold auto advance for a while so the carousel does not fight the user.
const RESUME_AFTER_MS = 12000

export function Gallery({ images, productName, badge }: GalleryProps) {
  const [active, setActive] = useState(0)
  const lastInteraction = useRef(0)
  const touchStartX = useRef<number | null>(null)

  const slides: Slide[] =
    images.length > 0
      ? images.map((img) => ({
          key: img._id,
          src: img.url,
          alt: img.alt || productName,
          tone: 'blush',
        }))
      : PLACEHOLDER_SLIDES

  const count = slides.length

  // Auto advance, skipping while the user has recently interacted and
  // while the tab is hidden.
  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => {
      if (document.hidden) return
      if (Date.now() - lastInteraction.current < RESUME_AFTER_MS) return
      setActive((i) => (i + 1) % count)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [count])

  const pick = (i: number) => {
    lastInteraction.current = Date.now()
    setActive(((i % count) + count) % count)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    pick(dx < 0 ? active + 1 : active - 1)
  }

  const main = slides[Math.min(active, slides.length - 1)]
  const counter = `${pad(active + 1)} / ${pad(slides.length)}`

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop: thumbs left of main image */}
      <div className="hidden lg:grid grid-cols-[88px_1fr] gap-4">
        <Thumbs slides={slides} active={active} onPick={pick} layout="vertical" />
        <MainSlide slide={main} alt={main.alt || productName} badge={badge} counter={counter} />
      </div>

      {/* Tablet: main image then horizontal thumb strip */}
      <div className="hidden md:flex lg:hidden flex-col gap-3">
        <MainSlide slide={main} alt={main.alt || productName} badge={badge} counter={counter} />
        <Thumbs slides={slides} active={active} onPick={pick} layout="horizontal" />
      </div>

      {/* Mobile: swipeable main image + dot indicators */}
      <div className="block md:hidden">
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <MainSlide
            slide={main}
            alt={main.alt || productName}
            ratio="1/1"
            badge={badge}
            counter={counter}
          />
        </div>
        {slides.length > 1 ? (
          <div className="flex justify-center gap-2 py-3.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                aria-label={`Show image ${i + 1}`}
                className={cn(
                  'rounded-full transition-all h-1.75',
                  i === active ? 'w-6 bg-ink' : 'w-1.75 bg-hairline',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── Inner pieces ──────────────────────────────────────────────────

function MainSlide({
  slide,
  alt,
  ratio = '4/5',
  badge,
  counter,
}: {
  slide: Slide
  alt: string
  ratio?: string
  badge?: GalleryProps['badge']
  counter?: string | null
}) {
  const badgeToneClass = badge ? (BADGE_TONE_CLASS[badge.tone ?? 'pink'] ?? 'bg-pink') : ''
  return (
    <div className="relative">
      <Photo
        src={slide.src}
        alt={alt}
        tone={slide.tone}
        ratio={ratio}
        label={!slide.src ? (slide.label ?? 'product') : undefined}
        // Above-the-fold on PDP. Make sure LCP isn't deferred.
        priority="eager"
      />
      {badge ? (
        <span
          className={cn(
            'absolute top-4.5 left-4.5 font-sans uppercase py-1.75 px-3.5 rounded-full text-white text-[11.5px] font-medium tracking-[0.08em]',
            badgeToneClass,
          )}
        >
          {badge.label}
        </span>
      ) : null}
      {counter ? (
        <span className="absolute bottom-4.5 right-4.5 font-mono py-2 px-3.5 rounded-full bg-paper border border-hairline text-ink text-[10.5px] tracking-[0.08em]">
          {counter}
        </span>
      ) : null}
    </div>
  )
}

function Thumbs({
  slides,
  active,
  onPick,
  layout,
}: {
  slides: Slide[]
  active: number
  onPick: (i: number) => void
  layout: 'vertical' | 'horizontal'
}) {
  // Horizontal layout splits evenly per slide, grid template lives in a CSS variable for the class shorthand.
  const horizontalVars: CSSProperties =
    layout === 'horizontal'
      ? ({ '--thumb-cols': `repeat(${slides.length},1fr)` } as CSSProperties)
      : ({} as CSSProperties)

  return (
    <div
      className={cn(
        layout === 'vertical' ? 'flex flex-col gap-2' : 'grid gap-2 grid-cols-(--thumb-cols)',
      )}
      style={horizontalVars}
    >
      {slides.map((slide, i) => (
        <button
          key={slide.key}
          type="button"
          onClick={() => onPick(i)}
          className={cn(
            'p-0 cursor-pointer bg-transparent overflow-hidden rounded-sm border-[1.5px]',
            i === active ? 'border-ink' : 'border-transparent',
          )}
          aria-label={`Show image ${i + 1}`}
        >
          <Photo
            src={slide.src}
            alt={slide.alt}
            tone={slide.tone}
            ratio="4/5"
            label={!slide.src ? slide.label : undefined}
          />
        </button>
      ))}
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
