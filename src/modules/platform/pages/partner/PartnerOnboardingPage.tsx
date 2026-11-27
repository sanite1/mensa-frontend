// /partner/onboarding?token=…, single use link from the approval email.
// Verify token, collect password and bank details, complete, then auto sign in and redirect to /partner.

import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { MField } from '@/components/design/MField'
import { AccountCard, AccountShell } from '@/modules/platform/components/AccountShell'
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
      <AccountShell eyebrow="Partner onboarding" title="Missing onboarding link.">
        <p className="lede max-w-130">
          The link you used does not include a token. Check the email we sent or contact
          partnerships@mensaproducts.com.
        </p>
      </AccountShell>
    )
  }

  if (verifyQuery.isLoading) {
    return (
      <AccountShell eyebrow="Partner onboarding" title="Checking your onboarding link…">
        {null}
      </AccountShell>
    )
  }

  if (verifyQuery.isError || !verifyQuery.data?.data?.partner) {
    return (
      <AccountShell eyebrow="Partner onboarding" title="This link is no longer valid.">
        <p className="lede max-w-130">
          Onboarding links expire after seven days or after they have been used once. Email
          partnerships@mensaproducts.com to get a fresh one.
        </p>
        <Link className="btn btn--ghost mt-8" to="/">
          Back home
        </Link>
      </AccountShell>
    )
  }

  const partner = verifyQuery.data.data.partner
  const submitting = completeMutation.isPending || loginMutation.isPending
  const errors = form.formState.errors

  return (
    <AccountShell
      eyebrow="Partner onboarding"
      title={<>Welcome, {partner.name.split(' ')[0]}.</>}
      lede={
        <>
          Your application is approved. You will earn <strong>{partner.commissionRate}%</strong> on
          every paid order from your referral link. Finish setting up your account below.
        </>
      }
    >
      <AccountCard className="max-w-180">
        <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <StepLabel>01 · Set a password</StepLabel>
          <MField label="Password" error={errors.password}>
            <input
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...form.register('password')}
            />
          </MField>
          <MField label="Confirm password" error={errors.confirmPassword}>
            <input
              type="password"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
            />
          </MField>

          <div className="border-t border-(--line) pt-6">
            <StepLabel>02 · Choose a referral code</StepLabel>
          </div>
          <MField
            label="Referral code (optional)"
            error={errors.referralCode}
            hint="3 to 16 letters or numbers, no spaces. Leave blank and we will generate one for you."
          >
            <input
              placeholder="ADAOK"
              autoCapitalize="characters"
              className="uppercase"
              {...form.register('referralCode', {
                setValueAs: (v: string) => (v ?? '').toUpperCase(),
              })}
            />
          </MField>

          <div className="border-t border-(--line) pt-6">
            <StepLabel>03 · Where should we pay you?</StepLabel>
          </div>
          <MField label="Account name" error={errors.accountName}>
            <input placeholder="Ada Okeke" {...form.register('accountName')} />
          </MField>
          <div className="mform__row">
            <MField label="Account number" error={errors.accountNumber}>
              <input
                placeholder="0123456789"
                inputMode="numeric"
                autoComplete="off"
                {...form.register('accountNumber')}
              />
            </MField>
            <MField label="Bank name" error={errors.bankName}>
              <input placeholder="Access Bank" {...form.register('bankName')} />
            </MField>
          </div>
          <p className="text-(length:--fs-sm) text-(--mute)">
            We use this to settle your commission payouts. You can update it later from your partner
            dashboard.
          </p>

          <button type="submit" className="btn w-full" disabled={submitting}>
            {submitting ? 'Activating…' : 'Activate my partner account'}
          </button>
        </form>
      </AccountCard>
    </AccountShell>
  )
}

function StepLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--mute)">
      {children}
    </span>
  )
}
