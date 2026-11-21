// Gallery: the design system's product photos. One large frame that swipes
// (scroll snap) on touch, a thumbnail strip, arrow buttons, and arrow keys
// when the gallery has focus.
import { useCallback, useEffect, useRef, useState } from 'react'

export function Gallery({
  images,
  alt,
  badge,
}: {
  images: { url: string; alt?: string }[]
  alt: string
  badge?: string | null
}) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const count = images.length

  // Which slide is showing, from the scroll position (swipes, arrows and thumbnails alike).
  useEffect(() => {
    const el = track.current
    if (!el || count < 2) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))),
      )
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [count])

  const go = useCallback(
    (i: number) => {
      const el = track.current
      if (!el) return
      const next = (i + count) % count
      const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
      setIndex(next)
    },
    [count],
  )

  if (!count) return <div className="pgallery__stage pgallery__stage--empty" aria-hidden />

  return (
    <div
      className="pgallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} photos`}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={(e) => {
        if (count < 2) return
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          go(index + 1)
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          go(index - 1)
        }
      }}
    >
      <div className="pgallery__stage">
        <div className="pgallery__track" ref={track}>
          {images.map((img, i) => (
            <div
              className="pgallery__slide"
              key={img.url}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <img
                src={img.url}
                className="absolute inset-0 size-full"
                alt={img.alt || (i === 0 ? alt : `${alt}, photo ${i + 1}`)}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
        {badge ? <span className="pbadge pgallery__badge">{badge}</span> : null}
        {count > 1 ? (
          <>
            <button
              type="button"
              className="pgallery__arrow pgallery__arrow--prev"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="pgallery__arrow pgallery__arrow--next"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <span className="pgallery__count" aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="pgallery__thumbs" role="tablist" aria-label="Choose a photo">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              className={`pgallery__thumb${i === index ? ' is-on' : ''}`}
              onClick={() => go(i)}
            >
              <img src={img.url} alt="" loading="lazy" className="absolute inset-0 size-full" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
