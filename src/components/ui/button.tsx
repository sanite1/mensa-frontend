import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Mensa button variants — see design tokens board.
 *   primary   pink/paper     headline CTAs (shop, sign in)
 *   ink       ink/paper      neutral confirm actions
 *   coral     coral/paper    rare emphasis (sale, urgent)
 *   secondary outline/ink    counterpart to primary
 *   soft      blush/berry    in-section calls inside blush surfaces
 *   ghost     transparent    chrome / inline links
 *
 * Variants use Tailwind theme tokens (text-paper, bg-ink, …) which are
 * defined in src/index.css @theme. This is more robust than arbitrary
 * value syntax (`text-[var(--paper)]`) which can lose specificity when
 * the Button is rendered via Radix Slot onto a child like <Link>.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 no-underline [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-pink text-paper hover:bg-pink-deep',
        ink: 'bg-ink text-paper hover:bg-graphite',
        coral: 'bg-coral text-paper hover:opacity-90',
        // Arbitrary-value CSS vars deliberately. Theme-token classes
        // (`text-ink` + `hover:text-paper`) lost a specificity tie in
        // production builds — base `text-ink` won on hover, leaving
        // ink text on the ink hover background (invisible). Arbitrary
        // value syntax forces Tailwind to mint a unique class name per
        // utility, so the cascade resolves correctly.
        secondary:
          'border border-[var(--ink)] bg-transparent text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]',
        soft: 'bg-blush text-berry hover:bg-blush-2',
        ghost: 'bg-transparent text-ink hover:bg-cream',
      },
      size: {
        sm: 'h-9 px-4 text-[13px]',
        default: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
