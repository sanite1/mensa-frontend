// /partner/onboarding?token=…, single use link from the approval email.
// Verify token, collect password and bank details, complete, then auto sign in and redirect to /partner.

import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  useCompletePartnerOnboarding,
  useVerifyOnboardingToken,
} from '@/lib/network/api/partner.api'
import { useLogin } from '@/lib/network/api/auth.api'
import { useSeo } from '@/lib/seo'

const onboardingSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
    confirmPassword: z.string(),
    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{3,16}$/, '3 to 16 letters or numbers, no spaces.')
      .or(z.literal('')),
    accountName: z.string().trim().min(2, 'Account name is required.').max(120),
    accountNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{6,12}$/, 'Account number must be 6 to 12 digits.'),
    bankName: z.string().trim().min(2, 'Bank name is required.').max(120),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
type OnboardingValues = z.infer<typeof onboardingSchema>

export function PartnerOnboardingPage() {
  useSeo({ title: 'Partner onboarding', noindex: true })
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const verifyQuery = useVerifyOnboardingToken(token || undefined)
  const completeMutation = useCompletePartnerOnboarding()
  const loginMutation = useLogin()

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      referralCode: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    const name = verifyQuery.data?.data?.partner?.name
    if (name) {
      const guess = name.split(' ').slice(0, 2).join(' ')
      if (!form.getValues('accountName')) form.setValue('accountName', guess)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyQuery.data?.data?.partner?.name])

  const onSubmit = async (values: OnboardingValues) => {
    if (!token) return
    completeMutation.mutate(
      {
        token,
        password: values.password,
        referralCode: values.referralCode || undefined,
        bankAccount: {
          accountName: values.accountName,
          accountNumber: values.accountNumber,
          bankName: values.bankName,
        },
      },
      {
        onSuccess: (res) => {
          const email = res.data?.email
          if (!email) return
          // Auto sign-in so the partner lands on the dashboard already
          // authenticated. useLogin handles role-based redirect.
          loginMutation.mutate({ email, password: values.password })
          // Belt-and-braces: nudge to /partner after a moment in case
          // login routes differently for any reason.
          setTimeout(() => navigate('/partner', { replace: true }), 250)
        },
      },
    )
  }

  if (!token) {
    return (
      <PageShell>
        <h1 className="m-0 font-display italic font-semibold text-[28px] leading-tight tracking-tight text-ink">
          Missing onboarding link.
        </h1>
        <p className="mt-3 t-body text-graphite">
          The link you used does not include a token. Check the email we sent or contact
          partnerships@mensaproducts.com.
        </p>
      </PageShell>
    )
  }

  if (verifyQuery.isLoading) {
    return (
      <PageShell>
        <p className="t-body-s text-mute">Checking your onboarding link…</p>
      </PageShell>
    )
  }

  if (verifyQuery.isError || !verifyQuery.data?.data?.partner) {
    return (
      <PageShell>
        <h1 className="m-0 font-display italic font-semibold text-[28px] leading-tight tracking-tight text-ink">
          This link is no longer valid.
        </h1>
        <p className="mt-3 t-body text-graphite">
          Onboarding links expire after seven days or after they have been used once. Email
          partnerships@mensaproducts.com to get a fresh one.
        </p>
        <div className="mt-6">
          <Button asChild variant="secondary" size="md">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </PageShell>
    )
  }

  const partner = verifyQuery.data.data.partner
  const submitting = completeMutation.isPending || loginMutation.isPending

  return (
    <PageShell>
      <div className="t-eyebrow text-mute mb-3">Partner onboarding</div>
      <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,5vw,44px)] leading-tight tracking-tight text-ink">
        Welcome, {partner.name.split(' ')[0]}.
      </h1>
      <p className="mt-3 max-w-130 t-body text-graphite">
        Your application is approved. You will earn <strong>{partner.commissionRate}%</strong>{' '}
        on every paid order from your referral link. Finish setting up your account below.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-6 bg-cream-soft border border-hairline-soft p-6 md:p-8"
        >
          {/* Password */}
          <div className="flex flex-col gap-4">
            <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              01 · Set a password
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
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
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Referral code */}
          <div className="flex flex-col gap-4 border-t border-hairline pt-6">
            <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              02 · Choose a referral code
            </div>
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral code (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ADAOK"
                      autoCapitalize="characters"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    3 to 16 letters or numbers, no spaces. Leave blank and we will generate one
                    for you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bank details */}
          <div className="flex flex-col gap-4 border-t border-hairline pt-6">
            <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              03 · Where should we pay you?
            </div>
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ada Okeke" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0123456789"
                        inputMode="numeric"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank name</FormLabel>
                    <FormControl>
                      <Input placeholder="Access Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="t-body-s text-mute">
              We use this to settle your commission payouts. You can update it later from your
              partner dashboard.
            </p>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting ? 'Activating…' : 'Activate my partner account'}
          </Button>
        </form>
      </Form>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-12 lg:py-20 bg-paper">
      <div className="max-w-180 mx-auto">{children}</div>
    </section>
  )
}
