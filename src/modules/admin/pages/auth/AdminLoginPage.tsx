// Admin /login, the design's split sign in screen. Same /auth/login backend as
// platform; useLogin only lets role=admin through on this surface.
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'

import { useLogin } from '@/lib/network/api/auth.api'
import { buildAppUrl } from '@/lib/network/helpers/buildAppUrl'
import { AButton, AField, AInput } from '@/modules/admin/components/ui'
import logo from '@/assets/mensa_logo.png'
import photo from '@/assets/kenny-000.jpg'

const schema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})
type Values = z.infer<typeof schema>

export function AdminLoginPage() {
  const login = useLogin()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  const errors = form.formState.errors

  const onSubmit = (values: Values) => login.mutate(values)

  return (
    <div className="a-login">
      <div className="a-login__art">
        <img src={photo} alt="" className="a-login__photo" />
        <img src={logo} alt="Mensa" width={110} className="a-login__logo" />
        <div>
          <h2>Every pant, pad and person, in one place.</h2>
          <p>Orders, stock and customers for the Mensa studio in Abuja.</p>
        </div>
      </div>
      <div className="a-login__panel">
        <form className="a-login__card" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div>
            <div className="a-eyebrow">Admin portal</div>
            <h1>Sign in.</h1>
          </div>
          <AField label="Email" error={errors.email?.message}>
            {(id) => (
              <AInput
                id={id}
                type="email"
                autoComplete="email"
                placeholder="you@mensaproducts.com"
                autoFocus
                {...form.register('email')}
              />
            )}
          </AField>
          <AField label="Password" error={errors.password?.message}>
            {(id) => (
              <AInput
                id={id}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register('password')}
              />
            )}
          </AField>
          <AButton variant="primary" type="submit" loading={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'} <ArrowRight />
          </AButton>
          <p className="a-faint text-center text-[12.5px]">
            Customers, head to{' '}
            <a href={buildAppUrl('platform')} className="a-link">
              mensaproducts.com
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  )
}
