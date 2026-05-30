// ═══════════════════════════════════════════════════════════════
// /forgot-password — request a password reset link.
// Backend is silent on unknown emails (no enumeration leak), so
// the page shows a confirmation state regardless of whether the
// email is registered.
// ═══════════════════════════════════════════════════════════════
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForgotPassword } from '@/lib/network/api/auth.api'
import { AuthShell } from '@/modules/platform/components/AuthShell'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
})

type ForgotValues = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
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
              className="text-(--ink) underline underline-offset-2"
            >
              Try again
            </button>
          </>
        }
      >
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
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
          Remembered it?{' '}
          <Link to="/login" className="text-(--ink) underline underline-offset-2">
            Back to sign in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={forgot.isPending}
          >
            {forgot.isPending ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  )
}
