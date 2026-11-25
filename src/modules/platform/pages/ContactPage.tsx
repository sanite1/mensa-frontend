// /contact, hero + channels + form (POST /contact). On success the form swaps for a confirmation panel.

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CSSProperties } from 'react'
import { CheckCircle2, Mail } from 'lucide-react'

import { MField } from '@/components/design/MField'
import { IconInstagram, IconTikTok } from '@/components/chrome/icons'

import { useSubmitContact } from '@/lib/network/api/contact.api'
import type { ContactTopic } from '@/lib/network/api/contact.api'
import { cn } from '@/lib/utils'
import { useSeo } from '@/lib/seo'

const TOPICS: { value: ContactTopic; label: string; helper: string }[] = [
  { value: 'order', label: 'My order', helper: 'Tracking, refunds, exchanges.' },
  { value: 'product', label: 'Product or sizing', helper: 'Fit, fabric, care, restocks.' },
  { value: 'partnership', label: 'Partnership', helper: 'Schools, NGOs, councils, individuals.' },
  { value: 'press', label: 'Press', helper: 'Interviews, samples, features.' },
  { value: 'other', label: 'Something else', helper: 'Anything not listed above.' },
]

const SOCIALS = [
  {
    label: 'Instagram',
    handle: '@shopmensa_',
    href: 'https://instagram.com/shopmensa_',
    Icon: IconInstagram,
  },
  {
    label: 'TikTok',
    handle: '@shopmensa',
    href: 'https://www.tiktok.com/@shopmensa',
    Icon: IconTikTok,
  },
] as const

// ─── Schema ──────────────────────────────────────────────────────

const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'Your name is required.').max(120),
    email: z.string().trim().email('Please enter a valid email.'),
    topic: z.enum(['order', 'product', 'partnership', 'press', 'other']),
    orderNumber: z.string().trim().max(40).optional().or(z.literal('')),
    message: z.string().trim().min(10, 'Tell us a bit more — at least 10 characters.').max(4000),
  })
  // Order number is only required when the topic is 'order'.
  .refine((v) => v.topic !== 'order' || (v.orderNumber && v.orderNumber.length > 0), {
    message: 'Order number helps us look it up faster.',
    path: ['orderNumber'],
  })
type ContactValues = z.infer<typeof contactSchema>

export function ContactPage() {
  useSeo({
    title: 'Contact us',
    description:
      'Questions about your order, our products, or a partnership? A real human on the Mensa team replies within 3 working days.',
  })
  // Deep-link prefill: /contact?topic=order&orderNumber=MS-2026-00001
  // Used from the confirmation page "need help" affordance, etc.
  const [params] = useSearchParams()
  const initialTopic = (params.get('topic') as ContactTopic | null) ?? 'order'
  const initialOrder = params.get('orderNumber') ?? ''

  const submit = useSubmitContact()
  const [done, setDone] = useState(false)

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      topic: TOPICS.some((t) => t.value === initialTopic) ? initialTopic : 'order',
      orderNumber: initialOrder,
      message: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = (values: ContactValues) => {
    submit.mutate(
      {
        name: values.name,
        email: values.email,
        topic: values.topic,
        orderNumber: values.orderNumber || undefined,
        message: values.message,
      },
      {
        onSuccess: () => {
          setDone(true)
          form.reset({
            name: '',
            email: '',
            topic: 'order',
            orderNumber: '',
            message: '',
          })
        },
      },
    )
  }

  return (
    <>
      <Hero />
      <section id="message" className="section">
        <div className="wrap track__grid">
          <Channels />
          <FormSection
            form={form}
            onSubmit={onSubmit}
            submitting={submit.isPending}
            done={done}
            onReset={() => setDone(false)}
          />
        </div>
      </section>
    </>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  return (
    <header className="fhero">
      <div className="wrap fhero__inner">
        <div>
          <span className="eyebrow">Contact · Real humans</span>
          <h1 className="split">
            <span className="split-line">
              <span>Say hello.</span>
            </span>
            <span className="split-line">
              <span style={{ '--d': '.1s' } as CSSProperties}>
                We will <span className="accent">say hello back.</span>
              </span>
            </span>
          </h1>
        </div>
        <div className="grid max-w-110 gap-5">
          <p className="lede max-w-none!">
            Questions about your order, our products, or a partnership? Drop us a message and a real
            person on the Mensa team will reply, usually within 3 working days.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#message" className="btn btn--ghost">
              Write a message
            </a>
            <span className="text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--mute)">
              Replies within 3 working days
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── CHANNELS ────────────────────────────────────────────────────
function Channels() {
  return (
    <aside data-reveal>
      <span className="eyebrow">Other ways</span>
      <h2 className="mt-4 text-(length:--fs-h3) tracking-tight">Or reach us directly.</h2>
      <a href="mailto:hi@mensaproducts.com" className="help-card mt-8 no-underline">
        <span className="flex items-center justify-between">
          <Mail size={20} strokeWidth={1.6} />
          <span className="text-(length:--fs-xs) uppercase tracking-[0.12em]">Email</span>
        </span>
        <h3>hi@mensaproducts.com</h3>
        <p>Best for order issues and detailed questions.</p>
      </a>

      {/* Socials */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--mute)">
          DMs open
        </span>
        {SOCIALS.map(({ label, handle, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} ${handle}`}
            title={`${label} ${handle}`}
            className="inline-flex items-center gap-2 rounded-full bg-(--white) px-3.5 py-2 text-(length:--fs-sm) text-(--ink) no-underline shadow-[inset_0_0_0_1px_var(--line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]"
          >
            <Icon size={14} />
            {handle}
          </a>
        ))}
      </div>
    </aside>
  )
}

// ─── FORM ────────────────────────────────────────────────────────
function FormSection({
  form,
  onSubmit,
  submitting,
  done,
  onReset,
}: {
  form: ReturnType<typeof useForm<ContactValues>>
  onSubmit: (values: ContactValues) => void
  submitting: boolean
  done: boolean
  onReset: () => void
}) {
  const topic = form.watch('topic')
  const errors = form.formState.errors
  return (
    <div className="ptn-card" data-reveal>
      <span className="eyebrow">Write to us</span>
      <h2 className="mt-4 text-(length:--fs-h3) tracking-tight">Send a message.</h2>
      <p className="mt-3 text-(--mute)">
        The more context the better — order number if relevant, what happened, what you want us to
        do. We reply from a real Mensa team inbox.
      </p>

      <div className="mt-8">
        {done ? (
          <SuccessPanel onReset={onReset} />
        ) : (
          <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="mform__row">
              <MField label="Your name" error={errors.name}>
                <input placeholder="Ada Okeke" autoComplete="name" {...form.register('name')} />
              </MField>
              <MField label="Email" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                />
              </MField>
            </div>

            <fieldset className="grid gap-2.5">
              <legend className="mb-2.5 text-(length:--fs-sm) font-medium">
                What is this about?
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {TOPICS.map((t) => {
                  const checked = topic === t.value
                  return (
                    <label
                      key={t.value}
                      className={cn('chip grid cursor-pointer gap-1 text-left', checked && 'is-on')}
                    >
                      <input
                        type="radio"
                        value={t.value}
                        className="sr-only"
                        {...form.register('topic')}
                      />
                      <span className="text-(--ink)">{t.label}</span>
                      <span className="text-(length:--fs-xs) font-normal text-(--mute)">
                        {t.helper}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {topic === 'order' ? (
              <MField
                label="Order number"
                error={errors.orderNumber}
                hint="From your confirmation email."
              >
                <input
                  placeholder="MS-2026-00001"
                  autoCapitalize="characters"
                  className="uppercase"
                  {...form.register('orderNumber', {
                    setValueAs: (v: string) => (v ?? '').toUpperCase(),
                  })}
                />
              </MField>
            ) : null}

            <MField label="Message" error={errors.message}>
              <textarea
                rows={6}
                placeholder="Tell us what happened, what you want us to do, and anything else that helps."
                {...form.register('message')}
              />
            </MField>

            <button type="submit" className="btn w-full" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
            <p className="text-(length:--fs-sm) text-(--mute)">
              By sending, you agree we may reply to you at the email address above. We never share
              contact details with anyone else.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-6 text-center">
      <div className="mb-5 inline-flex size-14 items-center justify-center rounded-full bg-(--blush) text-(--berry)">
        <CheckCircle2 size={28} strokeWidth={1.6} />
      </div>
      <h3 className="text-(length:--fs-h3) tracking-tight">Message received.</h3>
      <p className="mx-auto mt-3 max-w-130 text-(--mute)">
        Thank you. A real person on the Mensa team will reply within 3 working days, usually sooner.
        Check your inbox for a note from hi@mensaproducts.com.
      </p>
      <button type="button" className="btn btn--ghost mt-6" onClick={onReset}>
        Send another message
      </button>
    </div>
  )
}
