// MField: the design system's labelled form field (.mfield), wired for
// react-hook-form errors. Put an <input>, <select> or <textarea> inside.
import type { ReactNode } from 'react'
import type { FieldError } from 'react-hook-form'
import { cn } from '@/lib/utils'

export function MField({
  label,
  error,
  hint,
  aside,
  children,
}: {
  label: ReactNode
  error?: FieldError
  hint?: ReactNode
  /** Something on the right of the label row, like a "Forgot?" link. */
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <label className={cn('mfield', error && 'is-invalid')}>
      {aside ? (
        <span className="flex items-baseline justify-between gap-3">
          {label}
          {aside}
        </span>
      ) : (
        <span>{label}</span>
      )}
      {children}
      {error ? (
        <em>{error.message}</em>
      ) : hint ? (
        <small className="text-(length:--fs-xs) text-(--mute)">{hint}</small>
      ) : null}
    </label>
  )
}
