// Admin /login — same /auth/login backend as platform, useLogin only lets role=admin through on this surface.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
import { MensaWordmark } from '@/components/chrome/MensaWordmark'
import { useLogin } from '@/lib/network/api/auth.api'
import { PasswordField } from '@/modules/platform/components/PasswordField'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})
type Values = z.infer<typeof schema>

export function AdminLoginPage() {
  const login = useLogin()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: Values) => login.mutate(values)

  return (
    <div className="w-full max-w-110">
      <div className="bg-paper border border-hairline-soft p-8 md:p-10">
        <div className="flex flex-col items-start gap-6 mb-8">
          <MensaWordmark height={32} tone="pink" />
          <div>
            <div className="t-eyebrow text-mute mb-2">Admin portal</div>
            <h1 className="font-display italic font-semibold text-[36px] leading-[1.05] tracking-[-0.02em] text-ink">
              Sign in.
            </h1>
          </div>
        </div>

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
                      placeholder="you@mensaproducts.com"
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
                  <FormLabel>Password</FormLabel>
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
              variant="ink"
              size="lg"
              className="w-full mt-2"
              disabled={login.isPending}
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-5 text-center text-[13px] text-white/55">
        Customers, head to{' '}
        <a
          href={import.meta.env.VITE_PLATFORM_URL ?? 'http://localhost:3000'}
          className="text-paper underline underline-offset-2"
        >
          mensaproducts.com
        </a>
        .
      </p>
    </div>
  )
}
