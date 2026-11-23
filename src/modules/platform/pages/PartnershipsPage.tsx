// /partnerships in the design system's layout. Org tab posts to /b2b/apply,
// individual (referral) tab posts to /partners/apply. Tabs live in the
// ?as=org|individual query param so header and footer links can deep link.

import { useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { SplitHeading } from '@/components/design/SplitHeading'
import { useSubmitB2BOrg } from '@/lib/network/api/b2b.api'
import { useApplyAsPartner } from '@/lib/network/api/partner.api'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import type { B2BOrgType } from '@/lib/network/types/b2b.types'
import { cn } from '@/lib/utils'
import { useSeo } from '@/lib/seo'

import community from '@/assets/about-mensa.jpg'

type Mode = 'org' | 'individual'

const delay = (d: string) => ({ '--d': d }) as CSSProperties

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
)

const WHO = [
  {
    title: 'Schools',
    body: 'Public or private, primary through tertiary. Keep girls in class every day of the month.',
    d: 'M3 10 12 5l9 5-9 5-9-5Zm4 2.2V17c3 2 7 2 10 0v-4.8',
  },
  {
    title: 'NGOs',
    body: 'Non profits working on health, gender and education. Add lasting period care to your programmes.',
    d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  },
  {
    title: 'Government',
    body: 'Local, state or federal. Bring dignified, sustainable period care to communities at scale.',
    d: 'M4 20h16M5 20V10m14 10V10M9 20v-6m6 6v-6M3 10l9-6 9 6',
  },
  {
    title: 'Companies and groups',
    body: 'Corporates, religious bodies and community groups, as CSR, staff welfare or outreach.',
    d: 'M4 20V8l6-4v16m0-12h10v12M14 12h2m-2 4h2',
  },
  {
    title: 'Individuals',
    body: 'Share Mensa with your audience through a referral link and earn on every paid order.',
    d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c1.4-3.6 4-5.5 7-5.5s5.6 1.9 7 5.5',
  },
]

// Describe what partners get, not partner counts: any number printed here would be made up.
const OFFER = [
  {
    title: 'Discounts on Mensa products',
    body: 'Eligible organisations receive discounted pricing on reusable period products, books and educational materials.',
  },
  {
    title: 'School and community programmes',
    body: 'Menstrual health workshops, educator sessions and community outreach tailored to your audience.',
  },
  {
    title: 'Free educational resources',
    body: "Depending on the size of your order, you'll receive complimentary guides, activity materials and classroom resources.",
  },
  {
    title: 'Custom partnership support',
    body: 'Need something different? We create bespoke programmes for schools, NGOs, governments and community initiatives.',
  },
]

export function PartnershipsPage() {
  useSeo({
    title: 'Partnerships',
    description:
      'Schools, NGOs, governments and individuals can partner with Mensa to provide sustainable and dignified period care for girls in their communities.',
  })
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('as') === 'individual' ? 'individual' : 'org'
  const setMode = (next: Mode) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next === 'individual') p.set('as', 'individual')
        else p.delete('as')
        return p
      },
      { replace: true },
    )

  return (
    <main>
      <header className="fhero">
        <div className="wrap fhero__inner">
          <div>
            <span className="eyebrow">Partnerships</span>
            <h1 className="split">
              <span className="split-line">
                <span>Partnering to end</span>
              </span>
              <span className="split-line">
                <span style={delay('.1s')}>
                  <span className="accent">period poverty.</span>
                </span>
              </span>
            </h1>
          </div>
          <div className="grid justify-items-start gap-6">
            <p className="lede">
              Whether you run a school, an NGO, a government programme, or simply want to support
              girls in your community, we have a partnership for you. Apply below and we'll get back
              to you within five working days.
            </p>
            <a className="btn" href="#apply">
              Start an application{' '}
              <svg className="arrow" width="18" height="18">
                <use href="#i-arrow" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Who we work with
              </span>
              <SplitHeading lines={['Anyone who wants', 'girls to thrive.']} />
            </div>
            <p className="lede" data-reveal>
              Every partnership starts with a conversation about who you want to reach.
            </p>
          </div>
          <div className="ptn-who">
            {WHO.map((w, i) => (
              <article key={w.title} data-reveal style={delay(`${i * 0.06}s`)}>
                <i>{icon(w.d)}</i>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                What we offer
              </span>
              <SplitHeading lines={['Products, knowledge', 'and support.']} />
            </div>
          </div>
          <div className="ptn-offer lg:grid-cols-4">
            {OFFER.map((o, i) => (
              <article key={o.title} data-reveal style={delay(`${i * 0.08}s`)}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--blush scroll-mt-20" id="apply">
        <div className="wrap ptn-form-wrap">
          <div>
            <span className="eyebrow" data-reveal>
              Apply
            </span>
            <h2 data-reveal>Tell us how you'd like to partner.</h2>
            {mode === 'org' ? (
              <>
                <p className="lede mt-5" data-reveal>
                  Tell us a little about your organisation. A partnerships lead will come back to
                  you with what a partnership could look like.
                </p>
                <ol className="ptn-steps" data-reveal>
                  <li>
                    <b>Tell us who you want to reach</b>
                    <span>The girls, the place and roughly how many.</span>
                  </li>
                  <li>
                    <b>We shape a plan with you</b>
                    <span>Products, guides and workshops to fit your budget.</span>
                  </li>
                  <li>
                    <b>We deliver and follow up</b>
                    <span>From our studio in Abuja to your community.</span>
                  </li>
                </ol>
              </>
            ) : (
              <>
                <p className="lede mt-5" data-reveal>
                  Share Mensa with the people you reach and earn a commission on every paid order
                  through your link.
                </p>
                <ol className="ptn-steps" data-reveal>
                  <li>
                    <b>Apply with your details</b>
                    <span>
                      We review within five working days. If you create content or have an audience
                      that fits, mention it in the notes.
                    </span>
                  </li>
                  <li>
                    <b>Set up your account</b>
                    <span>
                      On approval we email you a one time link to set your password, bank details
                      and the referral code you want to use.
                    </span>
                  </li>
                  <li>
                    <b>Share your link and earn</b>
                    <span>
                      Commissions become cashable once the customer receives their order. Request a
                      payout anytime and we settle it within five working days.
                    </span>
                  </li>
                </ol>
              </>
            )}
            <div
              className="relative mt-8 aspect-16/10 overflow-hidden rounded-(--r-md)"
              data-reveal
            >
              <img
                src={community}
                alt="The Mensa team at a community event"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </div>

          <div className="ptn-card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="unit" role="tablist" aria-label="Partnership type">
                {(
                  [
                    { id: 'org', label: 'Organisation' },
                    { id: 'individual', label: 'Individual' },
                  ] as { id: Mode; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === t.id}
                    className={mode === t.id ? 'is-on' : ''}
                    onClick={() => setMode(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {mode === 'individual' ? <PartnerAccess /> : null}
            </div>
            {mode === 'org' ? <OrgApplicationForm /> : <IndividualApplicationForm />}
          </div>
        </div>
      </section>
    </main>
  )
}

/** Approved partners go to their dashboard; everyone else can sign in. */
function PartnerAccess() {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'partner')
    return (
      <Link to="/partner" className="text-(length:--fs-sm) font-medium text-(--berry)">
        Open my dashboard →
      </Link>
    )
  return (
    <span className="text-(length:--fs-sm) text-(--mute)">
      Already a partner?{' '}
      <Link to="/login?redirect=/partner" className="font-medium text-(--berry)">
        Sign in
      </Link>
    </span>
  )
}

// ─── Fields ──────────────────────────────────────────────────────

function Field({
  label,
  error,
  optional,
  hint,
  children,
}: {
  label: string
  error?: FieldError
  optional?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <label className={cn('mfield', error && 'is-invalid')}>
      <span>
        {label}
        {optional ? <small> (optional)</small> : null}
      </span>
      {children}
      {error ? (
        <em>{error.message}</em>
      ) : hint ? (
        <small className="text-(length:--fs-xs) text-(--mute)">{hint}</small>
      ) : null}
    </label>
  )
}

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />

function Done({ onReset, kind }: { onReset: () => void; kind: Mode }) {
  return (
    <div className="ptn-done" role="status">
      <i>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 5 5 9-10" />
        </svg>
      </i>
      <h3>Application received.</h3>
      <p>
        {kind === 'org'
          ? 'A partnerships lead at Mensa will email you within five working days.'
          : 'We will review your application within five working days. If approved, you will get an email with a link to finish setting up your partner account.'}
      </p>
      <button className="btn btn--ghost" type="button" onClick={onReset}>
        Submit another application
      </button>
    </div>
  )
}

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, 'Please enter a valid phone number.')

// ─── Organisation form ───────────────────────────────────────────

const orgSchema = z.object({
  name: z.string().trim().min(2, 'Organisation name is required.').max(200),
  type: z.enum(['school', 'ngo', 'council', 'other']),
  registrationNumber: z.string().trim().max(80).optional().or(z.literal('')),
  contactName: z.string().trim().min(2, 'Contact name is required.').max(120),
  contactEmail: z.string().trim().email('Please enter a valid email.'),
  contactPhone: phone,
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
type OrgValues = z.infer<typeof orgSchema>

const ORG_TYPES: { value: B2BOrgType; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'ngo', label: 'NGO' },
  { value: 'council', label: 'Government or council' },
  { value: 'other', label: 'Company, religious body or community group' },
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
  const { register } = form
  const errors = form.formState.errors

  const onSubmit = (v: OrgValues) =>
    submit.mutate(
      {
        name: v.name,
        type: v.type,
        registrationNumber: v.registrationNumber || undefined,
        contactName: v.contactName,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        notes: v.notes || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          form.reset()
        },
      },
    )

  if (submitted) return <Done onReset={() => setSubmitted(false)} kind="org" />

  return (
    <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="mform__row">
        <Field label="Organisation name" error={errors.name}>
          <Input
            placeholder="Loyola Jesuit College, Abuja"
            autoComplete="organization"
            {...register('name')}
          />
        </Field>
        <Field label="You are" error={errors.type}>
          <select {...register('type')}>
            {ORG_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label="Registration number"
        optional
        hint="CAC RC number, ministry code or equivalent. It speeds up verification."
        error={errors.registrationNumber}
      >
        <Input {...register('registrationNumber')} />
      </Field>
      <div className="mform__row">
        <Field label="Contact name" error={errors.contactName}>
          <Input placeholder="Mrs. Okonkwo" autoComplete="name" {...register('contactName')} />
        </Field>
        <Field label="Contact phone" error={errors.contactPhone}>
          <Input
            type="tel"
            placeholder="+234 803 000 0000"
            autoComplete="tel"
            {...register('contactPhone')}
          />
        </Field>
      </div>
      <Field label="Contact email" error={errors.contactEmail}>
        <Input
          type="email"
          placeholder="programs@example.org"
          autoComplete="email"
          {...register('contactEmail')}
        />
      </Field>
      <Field label="What would you like to do?" optional error={errors.notes}>
        <textarea
          rows={5}
          placeholder="Number of students, timeline, region, anything else we should know."
          {...register('notes')}
        />
      </Field>
      <button className="btn" type="submit" disabled={submit.isPending}>
        {submit.isPending ? (
          'Sending…'
        ) : (
          <>
            Submit application{' '}
            <svg className="arrow" width="18" height="18">
              <use href="#i-arrow" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

// ─── Individual form (referral partner) ──────────────────────────

const individualSchema = z.object({
  name: z.string().trim().min(2, 'Your name is required.').max(120),
  email: z.string().trim().email('Please enter a valid email.'),
  phone,
  socialHandle: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
type IndividualValues = z.infer<typeof individualSchema>

function IndividualApplicationForm() {
  const submit = useApplyAsPartner()
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<IndividualValues>({
    resolver: zodResolver(individualSchema),
    defaultValues: { name: '', email: '', phone: '', socialHandle: '', notes: '' },
    mode: 'onBlur',
  })
  const { register } = form
  const errors = form.formState.errors

  const onSubmit = (v: IndividualValues) =>
    submit.mutate(
      {
        name: v.name,
        email: v.email,
        phone: v.phone,
        socialHandle: v.socialHandle || undefined,
        notes: v.notes || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          form.reset()
        },
      },
    )

  if (submitted) return <Done onReset={() => setSubmitted(false)} kind="individual" />

  return (
    <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Field label="Your name" error={errors.name}>
        <Input placeholder="Ada Okeke" autoComplete="name" {...register('name')} />
      </Field>
      <div className="mform__row">
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input
            type="tel"
            placeholder="+234 803 000 0000"
            autoComplete="tel"
            {...register('phone')}
          />
        </Field>
      </div>
      <Field
        label="Where do you share?"
        optional
        hint="Helps us understand your audience. A blog, podcast or WhatsApp group works too."
        error={errors.socialHandle}
      >
        <Input
          placeholder="@yourhandle on Instagram, TikTok and so on"
          {...register('socialHandle')}
        />
      </Field>
      <Field label="Tell us about you" optional error={errors.notes}>
        <textarea
          rows={5}
          placeholder="Who you reach, why Mensa, anything else you want us to know."
          {...register('notes')}
        />
      </Field>
      <button className="btn" type="submit" disabled={submit.isPending}>
        {submit.isPending ? (
          'Sending…'
        ) : (
          <>
            Apply as a partner{' '}
            <svg className="arrow" width="18" height="18">
              <use href="#i-arrow" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
