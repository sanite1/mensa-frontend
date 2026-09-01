// /partnerships. Org tab posts to /b2b/apply, individual (referral) tab posts to /partners/apply.
// Tabs live in the ?as=org|individual query param so header and footer links can deep link.

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'

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
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'

import { useSubmitB2BOrg } from '@/lib/network/api/b2b.api'
import { useApplyAsPartner } from '@/lib/network/api/partner.api'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import type { B2BOrgType } from '@/lib/network/types/b2b.types'
import { cn } from '@/lib/utils'
import { useSeo } from '@/lib/seo'
import { Spinner } from '@/components/ui/spinner'

type Mode = 'org' | 'individual'

export function PartnershipsPage() {
  useSeo({
    title: 'Partnerships',
    description:
      'Schools, NGOs, governments and individuals can partner with Mensa to provide sustainable and dignified period care for girls in their communities.',
  })
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('as') === 'individual' ? 'individual' : 'org'

  const setMode = (next: Mode) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next === 'individual') p.set('as', 'individual')
        else p.delete('as')
        return p
      },
      { replace: true },
    )
  }

  return (
    <div className="bg-paper">
      <Hero />
      <Tiers />
      <ApplicationSection mode={mode} onModeChange={setMode} />
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="bg-paper">
      <div className="px-5 md:px-10 lg:px-16 pt-10 lg:pt-16 pb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3 text-coral">
          <span aria-hidden className="w-7 h-px bg-current opacity-60" />
          <span className="font-mono text-[11px] tracking-widest uppercase font-medium">
            Partnerships · For orgs and individuals
          </span>
        </div>
        <span className="font-mono text-[10.5px] tracking-widest uppercase text-mute">
          Applications open
        </span>
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
        <h1 className="m-0 font-display italic font-semibold text-[clamp(40px,8vw,128px)] leading-[0.95] tracking-tighter text-ink">
          Help us make
          <br />
          <span className="pl-[6%] lg:pl-[8%] block">period products more</span>
          <span className="pl-[14%] lg:pl-[18%] block">
            accessible <span className="text-pink">to women.</span>
          </span>
        </h1>

        <div className="mt-8 lg:mt-12 pt-5 flex flex-wrap items-baseline justify-between gap-5 border-t border-hairline">
          <p className="m-0 max-w-140 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            Whether you run a school, an NGO, a government programme, or simply want to support
            girls in your community, we have a partnership for you. Apply below and our team will
            get back to you within five working days.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 no-underline text-ink text-[13.5px] font-medium py-2.5 px-4 rounded-full border border-ink"
          >
            Start an application
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── TIERS ───────────────────────────────────────────────────────
// Describe what tiers get, not partner counts, any number printed here would be fabricated.
function Tiers() {
  const blocks: { kind: string; offer: string; copy: string }[] = [
    {
      kind: 'Pricing',
      offer: 'Discounts on Mensa products',
      copy: 'Eligible organisations receive discounted pricing on reusable period products, books and educational materials.',
    },
    {
      kind: 'Programmes',
      offer: 'School & community programmes',
      copy: 'We deliver engaging menstrual health workshops, educator sessions and community outreach programmes tailored to your audience.',
    },
    {
      kind: 'Resources',
      offer: 'Free educational resources',
      copy: "Depending on the size of your order, you'll receive complimentary guides, activity materials and classroom resources to support lasting impact.",
    },
    {
      kind: 'Bespoke',
      offer: 'Custom partnership support',
      copy: 'Need something different? We work with partners to create bespoke programmes for schools, NGOs, governments and community initiatives.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-16 lg:py-24 bg-cream">
      <div className="mb-10 lg:mb-12">
        <SectionEyebrow>What we offer</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-ink">
          Partnering to end period poverty.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {blocks.map((p) => (
          <div key={p.kind} className="bg-paper p-6 flex flex-col gap-3 h-full">
            <div className="font-mono text-[10.5px] tracking-widest uppercase text-mute font-medium">
              {p.kind}
            </div>
            <div className="font-display italic font-semibold text-[24px] leading-tight tracking-tight text-ink">
              {p.offer}
            </div>
            <p className="m-0 t-body-s text-graphite leading-relaxed">{p.copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── APPLICATION SECTION (tabs) ──────────────────────────────────
function ApplicationSection({
  mode,
  onModeChange,
}: {
  mode: Mode
  onModeChange: (m: Mode) => void
}) {
  // Contextual link for approved partners, dashboard when signed in, login otherwise.
  const user = useAuthStore((s) => s.user)
  const isPartner = user?.role === 'partner'

  return (
    <section id="apply" className="px-5 md:px-10 lg:px-16 py-20 lg:py-28 bg-paper">
      <div className="max-w-200 mx-auto">
        <SectionEyebrow color="var(--berry)">Apply</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-ink">
          Tell us how you would like to partner.
        </h2>

        {/* Tab switcher + partner-portal access */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Partnership type"
            className="inline-flex border border-ink"
          >
            {(
              [
                { id: 'org', label: 'Organisation' },
                { id: 'individual', label: 'Individual' },
              ] as { id: Mode; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={mode === t.id}
                onClick={() => onModeChange(t.id)}
                className={cn(
                  'px-5 py-2.5 text-[13px] uppercase tracking-widest font-medium border-r border-ink last:border-r-0',
                  mode === t.id ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream-soft',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === 'individual' ? (
            isPartner ? (
              <Button asChild variant="ink" size="md">
                <Link to="/partner">Open my dashboard</Link>
              </Button>
            ) : (
              <div className="text-[13px] text-graphite">
                Already a partner?{' '}
                <Link
                  to="/login?redirect=/partner"
                  className="text-ink underline underline-offset-4 hover:text-pink-deep font-medium"
                >
                  Sign in
                </Link>
              </div>
            )
          ) : null}
        </div>

        <div className="mt-8">
          {mode === 'org' ? <OrgApplicationForm /> : <IndividualApplicationForm />}
        </div>
      </div>
    </section>
  )
}

// ─── ORGANISATION FORM ───────────────────────────────────────────

const orgSchema = z.object({
  name: z.string().trim().min(2, 'Organisation name is required.').max(200),
  type: z.enum(['school', 'ngo', 'council', 'other']),
  registrationNumber: z.string().trim().max(80).optional().or(z.literal('')),
  contactName: z.string().trim().min(2, 'Contact name is required.').max(120),
  contactEmail: z.string().trim().email('Please enter a valid email.'),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Please enter a valid phone number.'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
type OrgValues = z.infer<typeof orgSchema>

const ORG_TYPES: { value: B2BOrgType; label: string; description: string }[] = [
  { value: 'school', label: 'School', description: 'Public or private, primary through tertiary.' },
  { value: 'ngo', label: 'NGO', description: 'Non-profits working on health, gender, education.' },
  { value: 'council', label: 'Council', description: 'Local, state, or federal government.' },
  {
    value: 'other',
    label: 'Other',
    description: 'Corporates, religious bodies, community groups.',
  },
]

function OrgApplicationForm() {
  const submit = useSubmitB2BOrg()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<OrgValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      type: 'school',
      registrationNumber: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = (values: OrgValues) => {
    submit.mutate(
      {
        name: values.name,
        type: values.type,
        registrationNumber: values.registrationNumber || undefined,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          form.reset()
        },
      },
    )
  }

  if (submitted) return <SuccessPanel onReset={() => setSubmitted(false)} kind="org" />

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 bg-cream-soft border border-hairline-soft p-6 md:p-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisation name</FormLabel>
              <FormControl>
                <Input placeholder="Loyola Jesuit College, Abuja" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ORG_TYPES.map((t) => {
                    const checked = field.value === t.value
                    return (
                      <label
                        key={t.value}
                        className={cn(
                          'flex items-start gap-3 border p-4 cursor-pointer',
                          checked
                            ? 'border-ink bg-paper'
                            : 'border-hairline bg-paper hover:border-graphite',
                        )}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={t.value}
                          checked={checked}
                          onChange={() => field.onChange(t.value)}
                          className="mt-1 accent-pink"
                        />
                        <span className="flex flex-col gap-1">
                          <span className="text-ink font-medium text-[14px]">{t.label}</span>
                          <span className="text-mute text-[12.5px]">{t.description}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration number</FormLabel>
              <FormControl>
                <Input placeholder="CAC RC number, ministry code, or equivalent" {...field} />
              </FormControl>
              <FormDescription>Optional, but it speeds up verification.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact name</FormLabel>
                <FormControl>
                  <Input placeholder="Mrs. Okonkwo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+234 803 000 0000" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="programs@example.org"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What would you like to do?</FormLabel>
              <FormControl>
                <textarea
                  rows={5}
                  placeholder="A few sentences on the scope: number of students, timeline, region, anything else we should know."
                  {...field}
                  className="flex w-full border border-hairline bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="primary" size="lg" disabled={submit.isPending}>
          {submit.isPending ? (
            <>
              <Spinner size={14} /> Sending…
            </>
          ) : (
            'Submit application'
          )}
        </Button>
      </form>
    </Form>
  )
}

// ─── INDIVIDUAL FORM (referral / affiliate) ──────────────────────

const individualSchema = z.object({
  name: z.string().trim().min(2, 'Your name is required.').max(120),
  email: z.string().trim().email('Please enter a valid email.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Please enter a valid phone number.'),
  socialHandle: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
type IndividualValues = z.infer<typeof individualSchema>

function IndividualApplicationForm() {
  const submit = useApplyAsPartner()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<IndividualValues>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      socialHandle: '',
      notes: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = (values: IndividualValues) => {
    submit.mutate(
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        socialHandle: values.socialHandle || undefined,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          form.reset()
        },
      },
    )
  }

  if (submitted) return <SuccessPanel onReset={() => setSubmitted(false)} kind="individual" />

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-hairline-soft bg-paper p-5">
        <div className="t-eyebrow text-mute mb-3">How it works</div>
        <ol className="m-0 pl-5 flex flex-col gap-2 text-graphite t-body-s">
          <li>
            Apply with your details. We review within five working days. If you create content or
            have an audience that fits, mention it in the notes.
          </li>
          <li>
            On approval we email you a one-time link to set your password, bank details, and the
            referral code you want to use.
          </li>
          <li>
            Share your unique link. You earn a commission on every paid order placed through it.
          </li>
          <li>
            Commissions become cashable once the customer receives their order. Request a payout
            anytime and we settle it manually within five working days.
          </li>
        </ol>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 bg-cream-soft border border-hairline-soft p-6 md:p-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+234 803 000 0000"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="socialHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Where do you share? (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="@yourhandle on Instagram, TikTok, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Helps us understand your audience. A blog, podcast, or whatsapp group works too.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tell us about you</FormLabel>
                <FormControl>
                  <textarea
                    rows={5}
                    placeholder="Who do you reach, why Mensa, anything else you want us to know."
                    {...field}
                    className="flex w-full border border-hairline bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant="primary" size="lg" disabled={submit.isPending}>
            {submit.isPending ? (
              <>
                <Spinner size={14} /> Sending…
              </>
            ) : (
              'Apply as a partner'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// ─── SUCCESS PANEL ───────────────────────────────────────────────

function SuccessPanel({ onReset, kind }: { onReset: () => void; kind: 'org' | 'individual' }) {
  return (
    <div className="bg-cream-soft border border-hairline-soft p-8 md:p-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ok/10 text-ok mb-5">
        <CheckCircle2 size={28} strokeWidth={1.6} />
      </div>
      <h3 className="m-0 font-display italic font-semibold text-[clamp(24px,3vw,32px)] leading-tight tracking-tight text-ink">
        Application received.
      </h3>
      <p className="mt-3 max-w-130 mx-auto t-body text-graphite">
        {kind === 'org' ? (
          <>A partnerships lead at Mensa will email you within five working days.</>
        ) : (
          <>
            We will review your application within five working days. If approved, you will get an
            email with a link to finish setting up your partner account.
          </>
        )}
      </p>
      <div className="mt-6">
        <Button type="button" variant="secondary" size="md" onClick={onReset}>
          Submit another application
        </Button>
      </div>
    </div>
  )
}
