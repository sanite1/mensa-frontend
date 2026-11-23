// Ported verbatim from the Mensa design repo (lib/story.ts).
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/**
 * How-it-works scroll story: maps scroll position inside the tall `.story`
 * section to the active step (panels + scenes) and a 0–1 progress (--lp)
 * that scrubs each scene's animation. Returns a cleanup function.
 */
export function initStory(story: HTMLElement): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const panels = [...story.querySelectorAll<HTMLElement>('.story__panel')]
  const scenes = [...story.querySelectorAll<HTMLElement>('.scene')]
  const railBtns = [...story.querySelectorAll<HTMLButtonElement>('.story__rail button')]
  const counter = story.querySelector<HTMLElement>('.story__counter')
  const layerEls = [...story.querySelectorAll<HTMLElement>('.layer')]
  const legend = [...story.querySelectorAll<HTMLElement>('.layers__legend li')]
  const n = panels.length
  story.style.setProperty('--steps', String(n + 1))
  let current = -1

  const update = () => {
    const r = story.getBoundingClientRect()
    const total = story.offsetHeight - innerHeight
    const p = clamp(-r.top / total)
    const f = p * n
    const step = Math.min(n - 1, Math.floor(f))
    const lp = clamp(f - step)

    if (step !== current) {
      current = step
      panels.forEach((el, i) => el.classList.toggle('is-active', i === step))
      scenes.forEach((el, i) => el.classList.toggle('is-active', i === step))
      if (counter) counter.textContent = `0${step + 1} / 0${n}`
    }
    scenes[step].style.setProperty('--lp', lp.toFixed(3))
    railBtns.forEach((b, i) =>
      b.style.setProperty('--fill', String(i < step ? 1 : i === step ? lp : 0)),
    )

    // Layers scene: highlight one layer at a time as you scroll (inner → outer)
    if (scenes[step].dataset.scene === 'layers') {
      const hot = lp < 0.2 ? -1 : 3 - Math.min(3, Math.floor((lp - 0.2) / 0.2))
      layerEls.forEach((el) => el.classList.toggle('is-hot', +(el.dataset.i ?? -2) === hot))
      legend.forEach((el) => el.classList.toggle('is-hot', +(el.dataset.i ?? -2) === hot))
    }
  }

  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      update()
      ticking = false
    })
  }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', update)
  update()

  const clicks = railBtns.map((b, i) => {
    const fn = () => {
      const total = story.offsetHeight - innerHeight
      scrollTo({
        top: story.offsetTop + total * ((i + 0.35) / n),
        behavior: reduce ? 'auto' : 'smooth',
      })
    }
    b.addEventListener('click', fn)
    return () => b.removeEventListener('click', fn)
  })

  return () => {
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', update)
    clicks.forEach((c) => c())
  }
}
