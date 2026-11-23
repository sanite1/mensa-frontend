// /reset-password?token=… page. useResetPassword navigates to /login on success.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'

import { MField } from '@/components/design/MField'
import { useResetPassword } from '@/lib/network/api/auth.api'
import { AuthShell } from '@/modules/platform/components/AuthShell'
import { PasswordField } from '@/modules/platform/components/PasswordField'
import { useSeo } from '@/lib/seo'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type ResetValues = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  useSeo({ title: 'Set a new password', noindex: true })
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const reset = useResetPassword()

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const errors = form.formState.errors

  // ── No token → invalid link ──
  if (!token) {
    return (
      <AuthShell
        eyebrow="Reset password"
        title={<>This link isn't valid.</>}
        subtitle="The reset link is missing or malformed. Request a new one."
      >
        <Link className="btn w-full" to="/forgot-password">
          Request a new link
        </Link>
      </AuthShell>
    )
  }

  const onSubmit = (values: ResetValues) => reset.mutate({ token, password: values.password })

  return (
    <AuthShell
      eyebrow="Reset password"
      title={<>Set a new password.</>}
      subtitle="Pick something strong. You'll be signed out of other devices."
      footer={
        <>
          Remembered it? <Link to="/login">Back to sign in</Link>
        </>
      }
    >
      <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <MField label="New password" error={errors.password}>
          <PasswordField
            design
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...form.register('password')}
          />
        </MField>
        <MField label="Confirm password" error={errors.confirmPassword}>
          <PasswordField
            design
            autoComplete="new-password"
            placeholder="Type it again"
            {...form.register('confirmPassword')}
          />
        </MField>
        <button type="submit" className="btn mt-2 w-full" disabled={reset.isPending}>
          {reset.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
