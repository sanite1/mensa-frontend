// /find-my-starter-set: the design system's fit quiz around our own eight
// questions and scoring. Intro, progress bar, sliding question panels with
// number key picks, our lead step (name and email, which emails a personal
// 10% code), then the recommendation as the design's result cards.

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useProducts } from '@/lib/network/api/product.api'
import { useSubmitStarterSetLead, type LeadResultCode } from '@/lib/network/api/lead.api'
import { useFormatPrice } from '@/lib/currency'
import type { Product } from '@/lib/network/types/product.types'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

// ─── Questions ───────────────────────────────────────────────────

type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8'

interface QuestionOption {
  value: string
  label: string
  note?: string
}

interface Question {
  id: QuestionId
  question: string
  help?: string
  options: QuestionOption[]
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'Have you used reusable pads or period pants before?',
    options: [
      { value: 'new', label: 'No, this is my first time' },
      { value: 'some', label: 'I have tried it once or twice' },
      { value: 'used', label: 'Yes, I use them already' },
    ],
  },
  {
    id: 'q2',
    question: 'How heavy is your flow on your heaviest days?',
    options: [
      { value: 'light', label: 'Light', note: 'I do not change often' },
      { value: 'medium', label: 'Medium', note: 'I change during the day but it is manageable' },
      { value: 'heavy', label: 'Heavy', note: 'I change often and I still stain' },
      { value: 'varies', label: 'It changes', note: 'Some months light, some months heavy' },
    ],
  },
  {
    id: 'q3',
    question: 'How many days does your period last?',
    options: [
      { value: 'short', label: '2 to 3 days' },
      { value: 'mid', label: '4 to 5 days' },
      { value: 'long', label: '6 days or more' },
    ],
  },
  {
    id: 'q4',
    question: 'What do your days look like?',
    options: [
      { value: 'home', label: 'I am at home most days' },
      { value: 'about', label: 'I move around a lot' },
      { value: 'classes', label: 'I am in school or at work all day' },
      { value: 'active', label: 'I am on my feet all day or I do sports' },
    ],
  },
  {
    id: 'q5',
    question: 'How old are you?',
    options: [
      { value: 'u18', label: 'Under 18' },
      { value: '18to24', label: '18 to 24' },
      { value: '25to34', label: '25 to 34' },
      { value: '35plus', label: '35 and above' },
    ],
  },
  {
    id: 'q6',
    question: 'What about at night?',
    options: [
      { value: 'leak', label: 'I stain at night or I wake up to change' },
      { value: 'worst', label: 'Only on my heaviest night' },
      { value: 'fine', label: 'No problem at night' },
    ],
  },
  {
    id: 'q7',
    question: 'How do you want to start?',
    options: [
      { value: 'allin', label: 'Buy everything at once', note: 'Save money' },
      {
        value: 'steady',
        label: 'Start with one thing and add more later',
        note: 'Try it for one period first',
      },
    ],
  },
  {
    id: 'q8',
    question: 'What matters most to you?',
    help: 'Pick one.',
    options: [
      { value: 'money', label: 'Price' },
      { value: 'leaks', label: 'Not staining' },
      { value: 'comfort', label: 'Comfort' },
      { value: 'easy', label: 'Not washing often' },
    ],
  },
]

// ─── Scoring ─────────────────────────────────────────────────────

type ResultCode = 'PADS' | 'PANT1' | 'PANT3' | 'PANT5' | 'PANT1_PADS' | 'PANT3_PADS'

type Answers = Partial<Record<QuestionId, string>>

const PANTS_POINTS: Partial<Record<QuestionId, Record<string, number>>> = {
  q2: { light: -1, medium: 0, varies: 1, heavy: 3 },
  q4: { home: 0, about: 1, classes: 2, active: 2 },
  q6: { fine: 0, worst: 1, leak: 2 },
  q8: { money: -2, comfort: 1, leaks: 2, easy: 0 },
  q1: { new: -1, some: 0, used: 1 },
  q5: { u18: -1, '18to24': -1, '25to34': 0, '35plus': 0 },
}

const QUANTITY_POINTS: Partial<Record<QuestionId, Record<string, number>>> = {
  q3: { short: 1, mid: 2, long: 3 },
  q6: { leak: 1, worst: 0, fine: 0 },
  q8: { easy: 1, money: 0, leaks: 0, comfort: 0 },
  q1: { new: -1, some: 0, used: 0 },
  q5: { u18: -1, '18to24': -1, '25to34': 0, '35plus': 1 },
}

function score(table: typeof PANTS_POINTS, answers: Answers): number {
  let total = 0
  for (const [qid, points] of Object.entries(table)) {
    const answer = answers[qid as QuestionId]
    if (answer && points && answer in points) total += points[answer]
  }
  return total
}

interface QuizResult {
  code: ResultCode
  padsAdded: boolean
  pantAdded: boolean
}

function computeResult(answers: Answers): QuizResult {
  // Step 1: pads or pants.
  const pantsScore = score(PANTS_POINTS, answers)
  let code: ResultCode
  if (pantsScore <= 2) {
    code = 'PADS'
  } else {
    // Step 2: how many pants.
    const quantity = score(QUANTITY_POINTS, answers)
    code = quantity <= 1 ? 'PANT1' : quantity <= 3 ? 'PANT3' : 'PANT5'
  }

  // Step 3: do the pads go in as well.
  let padsAdded = false
  let pantAdded = false
  const allin = answers.q7 === 'allin'

  if (code === 'PADS') {
    if (allin) {
      code = 'PANT1_PADS'
      pantAdded = true
    }
  } else if (code === 'PANT1' || code === 'PANT3') {
    const wantsPads = allin || answers.q3 === 'long' || answers.q2 === 'varies'
    const blockedByPrice = answers.q8 === 'money' && !allin
    if (wantsPads && !blockedByPrice) {
      code = code === 'PANT1' ? 'PANT1_PADS' : 'PANT3_PADS'
      padsAdded = true
    }
  }
  // PANT5 never adds pads, five pants already cover every day.

  return { code, padsAdded, pantAdded }
}

// ─── Result copy ─────────────────────────────────────────────────

const PADS_SLUG = 'reusable-pads'
const PANT1_SLUG = 'period-pants-singles'
const PANT3_SLUG = 'mensa-period-pants-pack-of-3'
const PANT5_SLUG = 'mensa-period-pants-pack-of-5'

const RESULTS: Record<ResultCode, { name: string; sub: string; reason: string; slugs: string[] }> =
  {
    PADS: {
      name: 'Pack of Pads',
      sub: 'Reusable pads with a wet bag and a handkerchief',
      reason:
        'Your flow is not too heavy and you can change when you need to, so pads are enough for you. The pack gives you enough to wear one, wash and still have extra for your heavier days.',
      slugs: [PADS_SLUG],
    },
    PANT1: {
      name: 'Single Pant',
      sub: 'One period pant',
      reason:
        'Your period is short, so one pant covers your heaviest day and night. It is also the cheapest way to find out how a pant fits you before you buy more.',
      slugs: [PANT1_SLUG],
    },
    PANT3: {
      name: 'Pack of 3 Pants',
      sub: 'Three period pants',
      reason:
        'Three pants can carry you through your period. One is on you, one is washed and one is dry and waiting, so you do not run out in the middle.',
      slugs: [PANT3_SLUG],
    },
    PANT5: {
      name: 'Pack of 5 Pants',
      sub: 'Five period pants',
      reason:
        'Your period runs long and heavy, so five pants cover you from the first day to the last. You do not need pads on top of this.',
      slugs: [PANT5_SLUG],
    },
    PANT1_PADS: {
      name: 'Single Pant and a Pack of Pads',
      sub: 'One pant for your heaviest day, pads for the rest',
      reason:
        'One pant covers your heaviest day and night, and the pads take care of your lighter days. Together they cover a full period.',
      slugs: [PANT1_SLUG, PADS_SLUG],
    },
    PANT3_PADS: {
      name: 'Pack of 3 Pants and a Pack of Pads',
      sub: 'Pants for the heavy days, pads for the light ones',
      reason:
        'Three pants carry your heavy days, one on you, one washed and one dry and waiting. The pads are for the light days at the start and the end.',
      slugs: [PANT3_SLUG, PADS_SLUG],
    },
  }

const X1 =
  'You said price matters most, and the pack of pads is the cheapest way to start. It covers a full period, so you do not need to buy anything else for now.'
const X2 =
  'Your days are the other reason pants suit you. You can wear one from morning till night without thinking about it.'
const X3 =
  'You said you want everything at once, so we added a pant for your heaviest day. One order means you pay delivery once instead of coming back for it later.'
const X4 =
  'You said you want everything at once, so the pads are in the set for your lighter days. One order means you pay delivery once instead of coming back for them later.'
const X5 =
  'You said you want everything at once. Five pants is the most we will sell you, because they already cover every day of your period.'
const X6 =
  'Count what you spend on disposable pads every month for the next two years. This costs less than that.'

function buildReason(answers: Answers, result: QuizResult): string[] {
  const paragraphs: string[] = []

  // X1 replaces R1 completely when she picks Price at Q8.
  if (result.code === 'PADS' && answers.q8 === 'money') {
    paragraphs.push(X1)
  } else {
    paragraphs.push(RESULTS[result.code].reason)
  }

  const hasPants = result.code !== 'PADS'
  if (hasPants && (answers.q4 === 'classes' || answers.q4 === 'active')) paragraphs.push(X2)
  if (result.pantAdded && answers.q7 === 'allin') paragraphs.push(X3)
  if (result.padsAdded && answers.q7 === 'allin') paragraphs.push(X4)
  if (result.code === 'PANT5' && answers.q7 === 'allin') paragraphs.push(X5)

  // Price sensitive flag: Q8 money, or under 25. Prices show on the result cards.
  const priceSensitive = answers.q8 === 'money' || answers.q5 === 'u18' || answers.q5 === '18to24'
  if (priceSensitive) paragraphs.push(X6)

  return paragraphs
}

// ─── Page ────────────────────────────────────────────────────────

export function StarterSetFinderPage() {
  useSeo({
    title: 'Find my starter set',
    description:
      'Answer 8 quick questions and we will tell you which Mensa reusable period products to start with.',
  })

  // -1 is the intro, 0..7 the questions, 8 the lead step, 9 the result.
  const [index, setIndex] = useState(-1)
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [answers, setAnswers] = useState<Answers>({})
  // Kept after a restart so a retake only needs one click through the form.
  const [lead, setLead] = useState<{ name: string; email: string } | null>(null)
  // True once the backend accepted the lead, which is when the code email goes out.
  const [codeEmailed, setCodeEmailed] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  const total = QUESTIONS.length
  const LEAD = total
  const RESULT = total + 1
  const result = useMemo(
    () => (index >= LEAD ? computeResult(answers) : null),
    [index, LEAD, answers],
  )

  // Move focus to the new heading so keyboard and screen reader users follow along.
  useEffect(() => {
    if (index >= 0) heading.current?.focus({ preventScroll: true })
  }, [index])

  const go = (to: number) => {
    setDir(to < index ? 'back' : 'fwd')
    setIndex(to)
    if (window.scrollY > 200) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const pick = (qid: QuestionId, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
    // A beat so the chosen option shows as picked before the panel slides.
    window.setTimeout(() => {
      setDir('fwd')
      setIndex((i) => Math.min(i + 1, LEAD))
    }, 220)
  }
  const restart = () => {
    setAnswers({})
    go(-1)
  }

  const question = index >= 0 && index < total ? QUESTIONS[index] : null
  const progress = index >= RESULT ? 100 : index < 0 ? 0 : (index / (total + 1)) * 100

  return (
    <main className="quiz-page">
      <div className="quiz">
        <div className="quiz__top wrap">
          <div
            className="quiz__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Quiz progress"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="quiz__nav">
            {index >= 0 && index < RESULT ? (
              <button type="button" className="quiz__back" onClick={() => go(index - 1)}>
                <svg width="16" height="16" className="rotate-180">
                  <use href="#i-arrow" />
                </svg>{' '}
                Back
              </button>
            ) : (
              <span />
            )}
            {question ? (
              <span className="quiz__count">
                Question {index + 1} of {total}
              </span>
            ) : index === LEAD ? (
              <span className="quiz__count">Last step</span>
            ) : null}
            {index >= 0 ? (
              <button type="button" className="quiz__restart" onClick={restart}>
                Start over
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>

        <div className="wrap quiz__stage">
          <div key={index} className={`quiz__panel quiz__panel--${dir}`}>
            {index < 0 ? (
              <div className="quiz__intro">
                <span className="eyebrow">Starter set</span>
                <h1>
                  Not sure what to buy first? <span className="accent">Answer 8 questions.</span>
                </h1>
                <p className="lede">
                  It takes less than a minute. We will tell you what to start with.
                </p>
                <button type="button" className="btn" onClick={() => go(0)}>
                  Start the quiz{' '}
                  <svg className="arrow" width="18" height="18">
                    <use href="#i-arrow" />
                  </svg>
                </button>
              </div>
            ) : null}

            {question ? (
              <QuestionStep
                heading={heading}
                question={question}
                value={answers[question.id]}
                onPick={(v) => pick(question.id, v)}
              />
            ) : null}

            {index === LEAD && result ? (
              <LeadStep
                heading={heading}
                answers={answers}
                result={result}
                defaults={lead}
                onDone={(values, emailed) => {
                  setLead(values)
                  setCodeEmailed(emailed)
                  go(RESULT)
                }}
              />
            ) : null}

            {index >= RESULT && result ? (
              <ResultStep
                heading={heading}
                answers={answers}
                result={result}
                codeEmailed={codeEmailed}
                onRestart={restart}
              />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── Steps ───────────────────────────────────────────────────────

function Drops({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 30 24" fill="currentColor" aria-hidden>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${5 + i * 10} 5s4 4.3 4 7.3a4 4 0 0 1-8 0c0-3 4-7.3 4-7.3Z`}
          opacity={i < n ? 1 : 0.22}
        />
      ))}
    </svg>
  )
}

/** The flow question gets the design's drop icons. */
const FLOW_DROPS: Record<string, number> = { light: 1, medium: 2, heavy: 3, varies: 2 }

function QuestionStep({
  heading,
  question,
  value,
  onPick,
}: {
  heading: RefObject<HTMLHeadingElement | null>
  question: Question
  value?: string
  onPick: (v: string) => void
}) {
  // Number keys pick an option: 1 for the first, and so on.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement)?.tagName === 'INPUT')
        return
      const n = Number(e.key)
      if (n >= 1 && n <= question.options.length) onPick(question.options[n - 1].value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, onPick])

  const n = question.options.length
  return (
    <fieldset className="quiz__q">
      <legend className="sr-only">{question.question}</legend>
      <h1 ref={heading} tabIndex={-1}>
        {question.question}
      </h1>
      {question.help ? <p className="quiz__hint">{question.help}</p> : null}
      <div className={cn('quiz__opts', (n === 3 || n === 2) && 'quiz__opts--3')}>
        {question.options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            className={`qopt${value === o.value ? ' is-on' : ''}`}
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
            style={{ '--i': i } as CSSProperties}
          >
            {question.id === 'q2' ? (
              <span className="qopt__icon">
                <Drops n={FLOW_DROPS[o.value] ?? 2} />
              </span>
            ) : null}
            <span className="qopt__text">
              <b>{o.label}</b>
              {o.note ? <small>{o.note}</small> : null}
            </span>
            <kbd aria-hidden>{i + 1}</kbd>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.'),
  email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
})
type LeadValues = z.infer<typeof leadSchema>

function LeadStep({
  heading,
  answers,
  result,
  defaults,
  onDone,
}: {
  heading: RefObject<HTMLHeadingElement | null>
  answers: Answers
  result: QuizResult
  defaults: { name: string; email: string } | null
  onDone: (values: LeadValues, emailed: boolean) => void
}) {
  const submitLead = useSubmitStarterSetLead()
  const form = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: defaults ?? { name: '', email: '' },
  })
  const errors = form.formState.errors

  const onSubmit = async (values: LeadValues) => {
    // Best effort: if the save fails the result still shows. Lead capture must
    // never stand between her and the recommendation.
    let emailed = false
    try {
      await submitLead.mutateAsync({
        name: values.name,
        email: values.email,
        answers: answers as Record<string, string>,
        resultCode: result.code as LeadResultCode,
        // The same reasoning she is about to read, plus where to buy, so the
        // code email can repeat the recommendation.
        reason: buildReason(answers, result).join('\n\n'),
        shopPath: `/shop/${RESULTS[result.code].slugs[0]}`,
      })
      emailed = true
    } catch {
      // Swallowed on purpose, see above.
    }
    onDone(values, emailed)
  }

  return (
    <div className="quiz__q">
      <h1 ref={heading} tabIndex={-1}>
        Who is this starter set for?
      </h1>
      <p className="quiz__hint">Tell us your name and email and your recommendation is next.</p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mform mx-auto mt-8 w-full max-w-120 text-left"
        noValidate
      >
        <label className={cn('mfield', errors.name && 'is-invalid')}>
          <span>Name</span>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your name"
            {...form.register('name')}
          />
          {errors.name ? <em>{errors.name.message}</em> : null}
        </label>
        <label className={cn('mfield', errors.email && 'is-invalid')}>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
          {errors.email ? <em>{errors.email.message}</em> : null}
        </label>
        <button type="submit" className="btn" disabled={submitLead.isPending}>
          {submitLead.isPending ? (
            'One moment…'
          ) : (
            <>
              Show my starter set{' '}
              <svg className="arrow" width="18" height="18">
                <use href="#i-arrow" />
              </svg>
            </>
          )}
        </button>
        <p className="quiz__fine">We will only use this to help you find the right products.</p>
      </form>
    </div>
  )
}

function ResultStep({
  heading,
  answers,
  result,
  codeEmailed,
  onRestart,
}: {
  heading: RefObject<HTMLHeadingElement | null>
  answers: Answers
  result: QuizResult
  codeEmailed: boolean
  onRestart: () => void
}) {
  const spec = RESULTS[result.code]
  const reasons = buildReason(answers, result)
  const catalogue = useProducts({ pageSize: 60 })
  const items: Product[] = catalogue.data?.data?.items ?? []
  const products = spec.slugs
    .map((slug) => items.find((p) => p.slug === slug))
    .filter((p): p is Product => !!p)

  return (
    <div className="results" aria-live="polite">
      <span className="eyebrow">We recommend</span>
      <h1 ref={heading} tabIndex={-1}>
        {spec.name}
      </h1>
      <p className="lede">{spec.sub}</p>
      <div className="mx-auto grid max-w-[60ch] gap-3 text-left text-(--mute)">
        {reasons.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {codeEmailed ? (
        <div className="results__note">
          <span className="results__note-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
            </svg>
          </span>
          <div>
            <b>10% off your first order</b>
            <p>
              We have emailed you a personal code. It works once, with this email, for the next 7
              days.
            </p>
          </div>
        </div>
      ) : null}

      {catalogue.isError ? (
        <div className="results__fallback">
          <p>We couldn't load the products just now.</p>
          <Link className="btn" to="/shop">
            Browse the shop{' '}
            <svg className="arrow" width="18" height="18">
              <use href="#i-arrow" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="results__grid">
          {products.map((p, i) => (
            <ResultCard key={p.id} product={p} primary={i === 0} />
          ))}
        </div>
      )}

      <div className="results__foot">
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Answer again
        </button>
      </div>
    </div>
  )
}

/** One card per item in the set. Pants need a size, so the button goes to the product page. */
function ResultCard({ product: p, primary }: { product: Product; primary: boolean }) {
  const formatPrice = useFormatPrice()
  const photo = [...(p.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
  return (
    <article className={`rcard${primary ? ' rcard--primary' : ''}`}>
      <Link to={`/shop/${p.slug}`} className="rcard__img" aria-label={p.name}>
        {photo ? <img src={photo.url} alt={p.name} className="absolute inset-0 size-full" /> : null}
      </Link>
      <div className="rcard__body">
        <div className="rcard__row">
          <h2>
            <Link to={`/shop/${p.slug}`}>{p.name}</Link>
          </h2>
          <b className="rcard__price">{formatPrice(p.salePrice ?? p.basePriceB2C)}</b>
        </div>
        <Link className={`btn${primary ? '' : ' btn--ghost'} rcard__add`} to={`/shop/${p.slug}`}>
          Buy this set{' '}
          <svg className="arrow" width="18" height="18">
            <use href="#i-arrow" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
