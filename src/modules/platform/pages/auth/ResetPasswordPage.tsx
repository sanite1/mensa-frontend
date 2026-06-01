// ═══════════════════════════════════════════════════════════════
// /reset-password?token=…  — set a new password using the token
// from the email link. useResetPassword navigates to /login on
// success.
// ═══════════════════════════════════════════════════════════════
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

  // ── No token → invalid link ──
  if (!token) {
    return (
      <AuthShell
        eyebrow="Reset password"
        title={<>This link isn't valid.</>}
        subtitle="The reset link is missing or malformed. Request a new one."
      >
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
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
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordField
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordField
                    autoComplete="new-password"
                    placeholder="Type it again"
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
            disabled={reset.isPending}
          >
            {reset.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  )
}
