import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // text-base keeps mobile font size at 16px so iOS Safari does not zoom on focus, 15px from md up.
          'flex h-11 w-full border border-(--hairline) bg-(--paper) px-3.5 py-2 text-base md:text-[15px] text-(--ink) placeholder:text-(--mute) focus-visible:outline-none focus-visible:border-(--ink) disabled:cursor-not-allowed disabled:opacity-50',
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
