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
 *   danger    err/paper      destructive confirm (archive, delete, reject)
 *
 * Variants use Tailwind theme tokens (text-paper, bg-ink, …) which are
 * defined in src/index.css @theme. This is more robust than arbitrary
 * value syntax (`text-(--paper)`) which can lose specificity when
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
        // The hover text colour MUST win — without the trailing `!` the
        // base `text-ink` keeps applying on :hover and you get ink text
        // on an ink hover background (invisible button). This has bitten
        // us twice across both arbitrary-var and theme-token spellings;
        // do not remove the `!` unless you've manually verified hover in
        // the browser.
        secondary:
          'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper!',
        soft: 'bg-blush text-berry hover:bg-blush-2',
        ghost: 'bg-transparent text-ink hover:bg-cream',
        danger: 'bg-err text-paper hover:opacity-90',
      },
      // NOTE: CVA silently produces *no* class when a `size`/`variant` value
      // is not in this map — buttons render with browser-default styling and
      // it looks like the component is broken. Every size used anywhere in
      // the app MUST be defined here. `md` is a friendly alias for `default`
      // and the most-used size in the codebase; keep them in sync.
      size: {
        sm: 'h-9 px-4 text-[13px]',
        md: 'h-11 px-6 text-sm',
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
