// ─────────────────────────────────────────────────────────────────────────
// Gallery — responsive PDP image gallery.
//   Desktop (lg) : main image + vertical thumb strip on the left.
//   Tablet  (md) : main image + horizontal thumb strip below.
//   Mobile  (sm) : main image + animated dot indicators.
//
// When the product has no images yet, the gallery falls back to a set of
// varied tone backed placeholder tiles (hero / flat / detail / pack) so the
// admin can preview the PDP layout before uploading real Cloudinary assets.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
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

const BADGE_BG: Record<string, string> = {
  pink: 'var(--pink)',
  coral: 'var(--coral)',
  ink: 'var(--ink)',
}

// Placeholder slides shown when a product has no Cloudinary images.
// Different tones give the gallery visual rhythm so the PDP doesn't read
// as broken pre upload.
const PLACEHOLDER_SLIDES: Slide[] = [
  { key: 'placeholder-hero', alt: '', tone: 'blush', label: 'hero' },
  { key: 'placeholder-flat', alt: '', tone: 'blush', label: 'flat' },
  { key: 'placeholder-detail', alt: '', tone: 'stripe', label: 'detail' },
  { key: 'placeholder-pack', alt: '', tone: 'cream', label: 'pack' },
]

export function Gallery({ images, productName, badge }: GalleryProps) {
  const [active, setActive] = useState(0)

  const slides: Slide[] =
    images.length > 0
      ? images.map((img) => ({
          key: img._id,
          src: img.url,
          alt: img.alt || productName,
          tone: 'blush',
        }))
      : PLACEHOLDER_SLIDES

  const main = slides[Math.min(active, slides.length - 1)]
  const counter = `${pad(active + 1)} / ${pad(slides.length)}`

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop: thumbs left of main image */}
      <div className="hidden lg:grid" style={{ gridTemplateColumns: '88px 1fr', gap: 16 }}>
        <Thumbs slides={slides} active={active} onPick={setActive} layout="vertical" />
        <MainSlide slide={main} alt={main.alt || productName} badge={badge} counter={counter} />
      </div>

      {/* Tablet: main image then horizontal thumb strip */}
      <div className="hidden md:flex lg:hidden flex-col gap-3">
        <MainSlide slide={main} alt={main.alt || productName} badge={badge} counter={counter} />
        <Thumbs slides={slides} active={active} onPick={setActive} layout="horizontal" />
      </div>

      {/* Mobile: main image + dot indicators */}
      <div className="block md:hidden">
        <MainSlide
          slide={main}
          alt={main.alt || productName}
          ratio="1/1"
          badge={badge}
          counter={counter}
        />
        {slides.length > 1 ? (
          <div className="flex justify-center gap-2 py-3.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                className="rounded-full transition-all"
                style={{
                  width: i === active ? 24 : 7,
                  height: 7,
                  background: i === active ? 'var(--ink)' : 'var(--hairline)',
                }}
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
  return (
    <div className="relative">
      <Photo
        src={slide.src}
        alt={alt}
        tone={slide.tone}
        ratio={ratio}
        label={!slide.src ? (slide.label ?? 'product') : undefined}
      />
      {badge ? (
        <span
          className="absolute font-sans uppercase"
          style={{
            top: 18,
            left: 18,
            padding: '7px 14px',
            borderRadius: 999,
            background: BADGE_BG[badge.tone ?? 'pink'] ?? 'var(--pink)',
            color: '#fff',
            fontSize: 11.5,
            fontWeight: 500,
            letterSpacing: '0.08em',
          }}
        >
          {badge.label}
        </span>
      ) : null}
      {counter ? (
        <span
          className="absolute font-mono"
          style={{
            bottom: 18,
            right: 18,
            padding: '8px 14px',
            borderRadius: 999,
            background: 'var(--paper)',
            border: '1px solid var(--hairline)',
            color: 'var(--ink)',
            fontSize: 10.5,
            letterSpacing: '0.08em',
          }}
        >
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
  return (
    <div
      className={cn(layout === 'vertical' ? 'flex flex-col gap-2' : 'grid gap-2')}
      style={
        layout === 'horizontal'
          ? { gridTemplateColumns: `repeat(${slides.length}, 1fr)` }
          : undefined
      }
    >
      {slides.map((slide, i) => (
        <button
          key={slide.key}
          type="button"
          onClick={() => onPick(i)}
          className="p-0 cursor-pointer bg-transparent overflow-hidden"
          style={{
            border: `1.5px solid ${i === active ? 'var(--ink)' : 'transparent'}`,
            borderRadius: 4,
          }}
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
