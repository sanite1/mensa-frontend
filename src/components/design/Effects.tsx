// Effects: page wide scroll effects from the design system, reveal on scroll,
// number count ups and image parallax. Timings, thresholds and easing match
// the design exactly. Our pages render after their data arrives, so a
// MutationObserver wires up anything that mounts after the route changes.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const REVEAL = '[data-reveal], .split'

export function Effects() {
  const { pathname } = useLocation()

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const seen = new WeakSet<Element>()

    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    // Count up numbers
    const fmt = new Intl.NumberFormat('en-NG')
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          const to = +(el.dataset.count ?? 0)
          const suffix = el.dataset.suffix ?? ''
          countIO.unobserve(el)
          if (reduce) {
            el.textContent = fmt.format(to) + suffix
            return
          }
          const t0 = performance.now()
          const dur = 1800
          const tick = (t: number) => {
            const p = clamp((t - t0) / dur)
            const eased = 1 - Math.pow(1 - p, 4)
            el.textContent = fmt.format(Math.round(to * eased)) + suffix
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
      },
      { threshold: 0.5 },
    )

    // Parallax on [data-parallax] images
    const px: HTMLElement[] = []
    const run = () =>
      px.forEach((el) => {
        if (!el.isConnected || !el.parentElement) return
        const r = el.parentElement.getBoundingClientRect()
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight
        el.style.transform = `translate3d(0, ${p * -60}px, 0)`
      })
    const onScroll = () => requestAnimationFrame(run)

    const wire = () => {
      document.querySelectorAll(REVEAL).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })
      document.querySelectorAll('[data-count]').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        countIO.observe(el)
      })
      if (reduce) return
      let added = false
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        px.push(el)
        added = true
      })
      if (added) run()
    }

    wire()
    let queued = false
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        wire()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })
    if (!reduce) addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      countIO.disconnect()
      mo.disconnect()
      removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  return null
}
