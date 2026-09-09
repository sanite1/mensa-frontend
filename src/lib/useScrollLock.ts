// useScrollLock — one shared body scroll lock for every drawer and overlay.
//
// Two bugs this exists to prevent:
//  1. Each overlay saving and restoring document.body.style.overflow on its
//     own. Open a second overlay over the first and it saves "hidden" as the
//     previous value, then restores it forever, so the page never scrolls
//     again and the dimmed backdrop appears stuck. The counter below means
//     the body is only released when the LAST lock lets go.
//  2. overflow:hidden does not actually lock scroll on iOS Safari, and
//     toggling it while the page is scrolled breaks position:fixed and
//     sticky elements. Pinning the body with position:fixed at a negative
//     offset does lock it, and the scroll position is restored on release.

import { useEffect } from 'react'

let lockCount = 0
let savedScrollY = 0
let savedStyles: {
  position: string
  top: string
  left: string
  right: string
  width: string
  overflow: string
} | null = null

function applyLock(): void {
  const body = document.body
  savedScrollY = window.scrollY
  savedStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  }
  body.style.position = 'fixed'
  body.style.top = `-${savedScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
}

function releaseLock(): void {
  const body = document.body
  if (savedStyles) {
    body.style.position = savedStyles.position
    body.style.top = savedStyles.top
    body.style.left = savedStyles.left
    body.style.right = savedStyles.right
    body.style.width = savedStyles.width
    body.style.overflow = savedStyles.overflow
    savedStyles = null
  }
  // Jump back to where the page was before the lock, without smooth
  // scrolling, so releasing never looks like the page moved.
  window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' as ScrollBehavior })
}

/** Locks body scroll while `active` is true. Safe to use from several
 *  overlays at once, the body is released once they have all closed. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    lockCount += 1
    if (lockCount === 1) applyLock()
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) releaseLock()
    }
  }, [active])
}

/** True while any overlay still holds the lock. */
export function isScrollLocked(): boolean {
  return lockCount > 0
}

/** Clears body styles an overlay left behind. Radix closes its sheets by
 *  unmounting a portal, and when a nav link inside the sheet navigates in
 *  the same tick the portal can go away before that cleanup runs, leaving
 *  overflow / pointer-events pinned on the body. The page then looks frozen
 *  under a backdrop that never fades and the sticky header stops sticking.
 *  Nothing happens while a lock is genuinely held. */
export function clearStrayScrollLock(): void {
  if (lockCount > 0) return
  const body = document.body
  if (
    !body.style.overflow &&
    !body.style.position &&
    !body.style.pointerEvents &&
    !body.style.top
  ) {
    return
  }
  body.style.removeProperty('overflow')
  body.style.removeProperty('position')
  body.style.removeProperty('top')
  body.style.removeProperty('left')
  body.style.removeProperty('right')
  body.style.removeProperty('width')
  body.style.removeProperty('pointer-events')
  body.style.removeProperty('padding-right')
}
