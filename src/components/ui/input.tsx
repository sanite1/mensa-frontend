import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full border border-[var(--hairline)] bg-[var(--paper)] px-3.5 py-2 text-[15px] text-[var(--ink)] placeholder:text-[var(--mute)] focus-visible:outline-none focus-visible:border-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
