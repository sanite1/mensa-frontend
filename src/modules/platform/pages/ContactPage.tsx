// /contact, hero + channels + form (POST /contact). On success the form swaps for a confirmation panel.

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Mail } from 'lucide-react'

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
    <div className="bg-paper">
      <Hero />
      <Channels />
      <FormSection
        form={form}
        onSubmit={onSubmit}
        submitting={submit.isPending}
        done={done}
        onReset={() => setDone(false)}
      />
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
            Contact · Real humans
          </span>
        </div>
        <span className="font-mono text-[10.5px] tracking-widest uppercase text-mute">
          Replies within 3 working days
        </span>
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
        <h1 className="m-0 font-display italic font-semibold text-[clamp(40px,8vw,128px)] leading-[0.95] tracking-tighter text-ink">
          Say hello.
          <br />
          <span className="pl-[6%] lg:pl-[8%] block">
            We will <span className="text-pink">say hello back.</span>
          </span>
        </h1>

        <div className="mt-8 lg:mt-12 pt-5 flex flex-wrap items-baseline justify-between gap-5 border-t border-hairline">
          <p className="m-0 max-w-140 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            Questions about your order, our products, or a partnership? Drop us a message and a real
            person on the Mensa team will reply, usually within 3 working days.
          </p>
          <a
            href="#message"
            className="inline-flex items-center gap-2 no-underline text-ink text-[13.5px] font-medium py-2.5 px-4 rounded-full border border-ink"
          >
            Write a message
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── CHANNELS ────────────────────────────────────────────────────
function Channels() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-16 lg:py-24 bg-cream">
      <div className="mb-10 lg:mb-12">
        <SectionEyebrow>Other ways</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-ink">
          Or reach us directly.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChannelCard
          icon={<Mail size={20} strokeWidth={1.6} />}
          label="Email"
          primary="hi@mensaproducts.com"
          href="mailto:hi@mensaproducts.com"
          note="Best for order issues and detailed questions."
        />
      </div>

      {/* Socials */}
      <div className="mt-8 flex items-center gap-3">
        <span className="t-eyebrow text-mute">DMs open</span>
        {SOCIALS.map(({ label, handle, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} ${handle}`}
            title={`${label} ${handle}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-paper text-ink rounded-full text-[13px] hover:border-ink no-underline"
          >
            <Icon size={14} />
            {handle}
          </a>
        ))}
      </div>
    </section>
  )
}

function ChannelCard({
  icon,
  label,
  primary,
  href,
  note,
}: {
  icon: React.ReactNode
  label: string
  primary: string
  href?: string
  note: string
}) {
  const body = (
    <div className="bg-paper p-6 flex flex-col gap-3 h-full">
      <div className="flex items-baseline justify-between">
        <span className="text-pink-deep">{icon}</span>
        <span className="t-eyebrow text-mute">{label}</span>
      </div>
      <div className="font-display italic font-semibold text-[20px] text-ink leading-tight">
        {primary}
      </div>
      <p className="m-0 t-body-s text-graphite">{note}</p>
    </div>
  )
  return href ? (
    <a href={href} className="no-underline group">
      {body}
    </a>
  ) : (
    body
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
  return (
    <section id="message" className="px-5 md:px-10 lg:px-16 py-20 lg:py-28 bg-paper">
      <div className="max-w-200 mx-auto">
        <SectionEyebrow color="var(--berry)">Write to us</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-ink">
          Send a message.
        </h2>
        <p className="mt-4 max-w-150 text-graphite text-[16px] leading-relaxed">
          The more context the better — order number if relevant, what happened, what you want us to
          do. We reply from a real Mensa team inbox.
        </p>

        <div className="mt-10">
          {done ? (
            <SuccessPanel onReset={onReset} />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6 bg-cream-soft border border-hairline-soft p-6 md:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ada Okeke" autoComplete="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
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
                </div>

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is this about?</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {TOPICS.map((t) => {
                            const checked = field.value === t.value
                            return (
                              <label
                                key={t.value}
                                className={cn(
                                  'flex flex-col gap-1 border p-3.5 cursor-pointer transition-colors',
                                  checked
                                    ? 'border-ink bg-paper'
                                    : 'border-hairline bg-paper hover:border-graphite',
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="radio"
                                    name="topic"
                                    value={t.value}
                                    checked={checked}
                                    onChange={() => field.onChange(t.value)}
                                    className="accent-pink"
                                  />
                                  <span className="text-ink font-medium text-[14px]">
                                    {t.label}
                                  </span>
                                </div>
                                <span className="text-[12px] text-mute pl-6">{t.helper}</span>
                              </label>
                            )
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Order number — conditional but always rendered to avoid
                    layout jumps on the dropdown change. */}
                {topic === 'order' ? (
                  <FormField
                    control={form.control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MS-2026-00001"
                            autoCapitalize="characters"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>From your confirmation email.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <textarea
                          rows={6}
                          placeholder="Tell us what happened, what you want us to do, and anything else that helps."
                          {...field}
                          className="flex w-full border border-hairline bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send message'}
                </Button>
                <p className="t-body-s text-mute m-0">
                  By sending, you agree we may reply to you at the email address above. We never
                  share contact details with anyone else.
                </p>
              </form>
            </Form>
          )}
        </div>
      </div>
    </section>
  )
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-cream-soft border border-hairline-soft p-8 md:p-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ok/10 text-ok mb-5">
        <CheckCircle2 size={28} strokeWidth={1.6} />
      </div>
      <h3 className="m-0 font-display italic font-semibold text-[clamp(24px,3vw,32px)] leading-tight tracking-tight text-ink">
        Message received.
      </h3>
      <p className="mt-3 max-w-130 mx-auto t-body text-graphite">
        Thank you. A real person on the Mensa team will reply within 3 working days, usually sooner.
        Check your inbox for a note from hi@mensaproducts.com.
      </p>
      <div className="mt-6">
        <Button type="button" variant="secondary" size="md" onClick={onReset}>
          Send another message
        </Button>
      </div>
    </div>
  )
}
