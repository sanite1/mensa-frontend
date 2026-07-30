import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/** Mensa button variants, see the design tokens board. Theme token classes (text-paper, bg-ink) are used over arbitrary value syntax, which can lose specificity when Button renders via Radix Slot onto a child like <Link>. */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 no-underline [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-pink text-paper hover:bg-pink-deep',
        ink: 'bg-ink text-paper hover:bg-graphite',
        coral: 'bg-coral text-paper hover:opacity-90',
        // The trailing `!` on hover:text-paper! must stay, otherwise base text-ink
        // wins on :hover and the label goes invisible on the ink hover fill.
        secondary:
          'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper!',
        soft: 'bg-blush text-berry hover:bg-blush-2',
        ghost: 'bg-transparent text-ink hover:bg-cream',
        danger: 'bg-err text-paper hover:opacity-90',
      },
      // CVA silently produces no class for an unknown `size`/`variant`, the button renders
      // unstyled. Every size used in the app must be defined here, `md` aliases `default`.
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
