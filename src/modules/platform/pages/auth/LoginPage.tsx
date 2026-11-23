// /login page. Side effects (toast, store, navigate) live inside useLogin.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'

import { MField } from '@/components/design/MField'
import { useLogin } from '@/lib/network/api/auth.api'
import { AuthShell } from '@/modules/platform/components/AuthShell'
import { PasswordField } from '@/modules/platform/components/PasswordField'
import { useSeo } from '@/lib/seo'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  useSeo({ title: 'Sign in', noindex: true })
  const login = useLogin()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const errors = form.formState.errors

  const onSubmit = (values: LoginValues) => login.mutate(values)

  return (
    <AuthShell
      eyebrow="Sign in"
      title={<>Welcome back.</>}
      subtitle="Pick up where you left off. Orders, addresses, and your switch."
      footer={
        <>
          New to Mensa? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <MField label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
        </MField>
        <MField
          label="Password"
          error={errors.password}
          aside={
            <Link
              to="/forgot-password"
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--mute) hover:text-(--ink)"
            >
              Forgot?
            </Link>
          }
        >
          <PasswordField
            design
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register('password')}
          />
        </MField>
        <button type="submit" className="btn mt-2 w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}
