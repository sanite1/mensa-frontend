// ─────────────────────────────────────────────────────────────────────────
// PasswordField — password input with show/hide toggle, styled to match
// the Mensa Input primitive. Drop in any react-hook-form context the same
// way you'd use <Input />.
// ─────────────────────────────────────────────────────────────────────────
import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'flex h-11 w-full border border-[var(--hairline)] bg-[var(--paper)] pl-3.5 pr-11 py-2 text-[15px] text-[var(--ink)] placeholder:text-[var(--mute)] focus-visible:outline-none focus-visible:border-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center text-[var(--mute)] hover:text-[var(--ink)]"
        >
          {visible ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
        </button>
      </div>
    )
  },
)
PasswordField.displayName = 'PasswordField'
