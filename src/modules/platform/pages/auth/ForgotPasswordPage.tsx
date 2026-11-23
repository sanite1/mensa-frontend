// /forgot-password page. Always shows the same success state, whether or not
// the email exists, so the form can't be used to discover accounts.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'

import { MField } from '@/components/design/MField'
import { useForgotPassword } from '@/lib/network/api/auth.api'
import { AuthShell } from '@/modules/platform/components/AuthShell'
import { useSeo } from '@/lib/seo'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
})

type ForgotValues = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  useSeo({ title: 'Reset your password', noindex: true })
  const forgot = useForgotPassword()
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = (values: ForgotValues) => forgot.mutate(values)

  // ── Success state ──
  if (forgot.isSuccess) {
    return (
      <AuthShell
        eyebrow="Check your inbox"
        title={<>One last step.</>}
        subtitle="If an account exists for that email, we've sent a reset link. It will expire in 60 minutes."
        footer={
          <>
            Wrong email?{' '}
            <button
              type="button"
              onClick={() => {
                forgot.reset()
                form.reset()
              }}
              className="underline"
            >
              Try again
            </button>
          </>
        }
      >
        <Link className="btn btn--ghost w-full" to="/login">
          Back to sign in
        </Link>
      </AuthShell>
    )
  }

  // ── Form ──
  return (
    <AuthShell
      eyebrow="Reset password"
      title={<>Forgot your password?</>}
      subtitle="Tell us your email and we'll send a reset link."
      footer={
        <>
          Remembered it? <Link to="/login">Back to sign in</Link>
        </>
      }
    >
      <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <MField label="Email" error={form.formState.errors.email}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
        </MField>
        <button type="submit" className="btn mt-2 w-full" disabled={forgot.isPending}>
          {forgot.isPending ? 'Sending link…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  )
}
