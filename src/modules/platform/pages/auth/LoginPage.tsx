// /login page. Side effects (toast, store, navigate) live inside useLogin.
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
import { useLogin } from '@/lib/network/api/auth.api'
import { AuthShell } from '@/modules/platform/components/AuthShell'
import { PasswordField } from '@/modules/platform/components/PasswordField'
import { useSeo } from '@/lib/seo'
import { Spinner } from '@/components/ui/spinner'

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

  const onSubmit = (values: LoginValues) => login.mutate(values)

  return (
    <AuthShell
      eyebrow="Sign in"
      title={<>Welcome back.</>}
      subtitle="Pick up where you left off. Orders, addresses, and your switch."
      footer={
        <>
          New to Mensa?{' '}
          <Link to="/register" className="text-(--ink) underline underline-offset-2">
            Create an account
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] uppercase tracking-[0.12em] font-medium text-(--mute) hover:text-(--ink)"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <PasswordField
                    autoComplete="current-password"
                    placeholder="••••••••"
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
            disabled={login.isPending}
          >
            {login.isPending ? (
              <>
                <Spinner size={14} /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>
    </AuthShell>
  )
}
