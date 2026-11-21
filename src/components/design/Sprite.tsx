import type { CSSProperties } from 'react'

// Sprite: inline SVG symbol sheet from the design system. Reference an icon with
// <svg><use href="#i-bag" /></svg>. Mounted once by the platform layout.
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' } as CSSProperties} aria-hidden="true">
      <defs>
        <symbol
          id="i-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </symbol>
        <symbol
          id="i-search"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </symbol>
        <symbol
          id="i-bag"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </symbol>
        <symbol
          id="i-menu"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <path d="M4 8h16M4 16h16" />
        </symbol>
        <symbol
          id="i-user"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </symbol>
        <symbol
          id="i-drop"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        >
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
        </symbol>
        <symbol
          id="i-leaf"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" />
          <path d="M5 19 14 10" />
        </symbol>
        <symbol
          id="i-wallet"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V7Z" />
          <path d="M4 7l11-3v3" />
          <circle cx="16" cy="13.5" r="1.2" fill="currentColor" />
        </symbol>
        <symbol
          id="i-clock"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </symbol>
        <symbol
          id="i-shield"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        >
          <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" strokeLinecap="round" />
        </symbol>
        <symbol
          id="i-repeat"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 11V9a3 3 0 0 1 3-3h12M16 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H5M8 21l-3-3 3-3" />
        </symbol>
        <symbol id="pant" viewBox="0 0 240 180">
          <path
            d="M20 44 Q120 58 220 44 L218 78 C176 92 152 118 142 160 L138 168 Q120 174 102 168 L98 160 C88 118 64 92 22 78 Z"
            fill="var(--pant, #1A1410)"
          />
          <path d="M20 20 Q120 34 220 20 L220 44 Q120 58 20 44 Z" fill="var(--band, #3A2E26)" />
          <path
            d="M104 92 Q120 86 136 92 L134 160 Q120 166 106 160 Z"
            fill="var(--gusset, #FE718E)"
            opacity=".9"
          />
          <text
            x="168"
            y="38"
            fontFamily="Figtree Variable, Figtree, sans-serif"
            fontSize="11"
            fontWeight="600"
            fill="#F59A7A"
          >
            Mensa
          </text>
        </symbol>
      </defs>
    </svg>
  )
}
