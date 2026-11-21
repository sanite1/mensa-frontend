// Ported verbatim from the design repo (apps/web/lib/hero.ts). Timings and
// parallax factors match the design exactly.
/**
 * Home hero slideshow: auto-advance with progress bars, pause/play, swipe,
 * scroll parallax and mouse parallax on the product stage.
 * Returns a cleanup function for React's useEffect.
 */
export function initHero(hero: HTMLElement): () => void {
  const slides = [...hero.querySelectorAll<HTMLElement>('.xslide')]
  const bars = [...hero.querySelectorAll<HTMLButtonElement>('.xhero__bars button')]
  const pauseBtn = hero.querySelector<HTMLButtonElement>('.xhero__pause')!
  const frame = hero.querySelector<HTMLElement>('.xhero__frame')!
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const DUR = 6500
  let i = 0,
    started = 0,
    remaining = DUR,
    paused = reduce
  let timer: ReturnType<typeof setTimeout> | undefined
  const off: (() => void)[] = []
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement | Window | Document,
    type: K | string,
    fn: EventListener,
    opts?: AddEventListenerOptions,
  ) => {
    el.addEventListener(type, fn, opts)
    off.push(() => el.removeEventListener(type, fn, opts))
  }
  hero.style.setProperty('--dur', DUR + 'ms')

  const schedule = () => {
    clearTimeout(timer)
    if (paused) return
    started = performance.now()
    timer = setTimeout(() => go(i + 1), remaining)
  }

  const go = (n: number) => {
    i = (n + slides.length) % slides.length
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i)
      s.setAttribute('aria-hidden', String(k !== i))
    })
    bars.forEach((b, k) => {
      b.classList.remove('is-active')
      b.classList.toggle('is-done', k < i)
      void b.offsetWidth // restart the bar animation
      if (k === i) b.classList.add('is-active')
    })
    const theme = slides[i].dataset.theme ?? 'dark'
    hero.dataset.theme = theme
    hero.dataset.slide = String(i)
    const nav = document.querySelector<HTMLElement>('.nav--overlay')
    if (nav) nav.dataset.theme = theme
    remaining = DUR
    schedule()
  }

  const setPaused = (p: boolean) => {
    if (p === paused) return
    paused = p
    hero.classList.toggle('is-paused', p)
    pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow')
    if (p) {
      clearTimeout(timer)
      remaining -= performance.now() - started
    } else schedule()
  }

  bars.forEach((b, k) => on(b, 'click', () => go(k)))
  on(pauseBtn, 'click', () => setPaused(!paused))
  hero.classList.toggle('is-paused', paused)

  // swipe on touch
  let x0: number | null = null
  on(
    hero,
    'touchstart',
    ((e: TouchEvent) => {
      x0 = e.touches[0].clientX
    }) as EventListener,
    { passive: true },
  )
  on(hero, 'touchend', ((e: TouchEvent) => {
    if (x0 === null) return
    const dx = e.changedTouches[0].clientX - x0
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1))
    x0 = null
  }) as EventListener)

  // pause when the tab is hidden
  on(document, 'visibilitychange', () => (document.hidden ? clearTimeout(timer) : schedule()))

  // scroll parallax: imagery drifts, copy lifts and fades
  if (!reduce) {
    const onScroll = () =>
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, frame.offsetHeight)
        const p = y / frame.offsetHeight
        hero
          .querySelectorAll<HTMLElement>('.xslide__img, .xslide__product')
          .forEach((el) => (el.style.translate = `0 ${y * 0.25}px`))
        hero.querySelectorAll<HTMLElement>('.xslide__copy').forEach((el) => {
          el.style.translate = `0 ${y * -0.12}px`
          el.style.opacity = String(1 - p * 1.3)
        })
      })
    on(window, 'scroll', onScroll, { passive: true })
  }

  // mouse parallax on the product stage
  const stage = hero.querySelector<HTMLElement>('.xstage')
  if (stage && !reduce && matchMedia('(pointer: fine)').matches) {
    const layers = [...stage.querySelectorAll<HTMLElement>('[data-depth]')]
    on(hero, 'pointermove', ((e: PointerEvent) => {
      const r = hero.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5
      layers.forEach((l) => {
        const d = +(l.dataset.depth ?? 0)
        l.style.translate = `${-x * d}px ${-y * d}px`
      })
    }) as EventListener)
    on(hero, 'pointerleave', () => layers.forEach((l) => (l.style.translate = '0 0')))
  }

  go(0)
  return () => {
    clearTimeout(timer)
    off.forEach((f) => f())
  }
}
