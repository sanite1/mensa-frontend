// /register page. Side effects (toast, store, navigate) live inside useRegister.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'

import { MField } from '@/components/design/MField'
import { useRegister } from '@/lib/network/api/auth.api'
import { AuthShell } from '@/modules/platform/components/AuthShell'
import { PasswordField } from '@/modules/platform/components/PasswordField'
import { useSeo } from '@/lib/seo'

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name cannot be longer than 80 characters.'),
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  phone: z.string().regex(/^\+?[0-9\s-]{7,20}$/, 'Please enter a valid phone number.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  useSeo({ title: 'Create an account', noindex: true })
  const register = useRegister()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  })
  const errors = form.formState.errors

  const onSubmit = (values: RegisterValues) => register.mutate(values)

  return (
    <AuthShell
      eyebrow="Create account"
      title={<>Welcome to Mensa.</>}
      subtitle="Switch once. Wear for five years. Let's get you set up."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <MField label="Full name" error={errors.name}>
          <input autoComplete="name" placeholder="Ada Eze" {...form.register('name')} />
        </MField>
        <MField label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
        </MField>
        <MField label="Phone" error={errors.phone}>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="+234 801 234 5678"
            {...form.register('phone')}
          />
        </MField>
        <MField label="Password" error={errors.password}>
          <PasswordField
            design
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...form.register('password')}
          />
        </MField>

        <p className="text-(length:--fs-sm) text-(--mute) [&_a]:text-(--berry) [&_a]:underline">
          By creating an account you agree to our <Link to="/terms">terms</Link> and{' '}
          <Link to="/privacy">privacy policy</Link>.
        </p>

        <button type="submit" className="btn w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
