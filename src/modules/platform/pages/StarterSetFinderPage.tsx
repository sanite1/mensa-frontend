// /find-my-starter-set — eight question quiz that recommends a starter set.
// Logic and copy follow the starter set finder spec: two scores, six results.
// One tap per question auto-advances, back button steps back, no submit.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { IconArrowRight } from '@/components/chrome/icons'
import { useProducts } from '@/lib/network/api/product.api'
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

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const done = step >= QUESTIONS.length

  // TODO: fire an analytics event with all eight answers + result code once
  // an events endpoint exists.
  const result = useMemo(() => (done ? computeResult(answers) : null), [done, answers])

  const pick = (qid: QuestionId, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
    setStep((s) => s + 1)
  }

  const back = () => setStep((s) => Math.max(0, s - 1))
  const restart = () => {
    setAnswers({})
    setStep(0)
  }

  return (
    <div className="bg-paper min-h-[70vh]">
      <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16 max-w-200 mx-auto">
        {/* Head */}
        <SectionEyebrow color="var(--coral)">Starter set</SectionEyebrow>
        <h1 className="mt-5 font-display italic font-semibold text-[clamp(30px,5vw,52px)] leading-[1.02] tracking-tight text-ink">
          {done ? 'Your starter set.' : 'Not sure what to buy first? Answer 8 questions.'}
        </h1>
        {!done ? (
          <p className="mt-3 t-body text-graphite">
            It takes less than a minute. We will tell you what to start with.
          </p>
        ) : null}

        {/* Progress strip */}
        <div className="mt-7 flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((q, i) => (
            <span
              key={q.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < step ? 'bg-pink' : 'bg-hairline',
              )}
            />
          ))}
        </div>

        {/* Stage */}
        {!done ? (
          <QuestionStage question={QUESTIONS[step]} onPick={pick} />
        ) : result ? (
          <ResultStage answers={answers} result={result} onRestart={restart} />
        ) : null}

        {/* Foot */}
        <div className="mt-8 pt-5 border-t border-hairline-soft flex items-center justify-between">
          {step > 0 && !done ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-2 text-[13.5px] font-medium text-ink"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <span />
          )}
          <span className="font-mono text-[11px] tracking-widest uppercase text-mute">
            {done ? 'Done' : `Question ${step + 1} of ${QUESTIONS.length}`}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Stages ──────────────────────────────────────────────────────

function QuestionStage({
  question,
  onPick,
}: {
  question: Question
  onPick: (qid: QuestionId, value: string) => void
}) {
  return (
    <div className="mt-9">
      <h2 className="m-0 font-display italic font-semibold text-[clamp(22px,3vw,30px)] leading-[1.15] tracking-tight text-ink">
        {question.question}
      </h2>
      {question.help ? <p className="mt-2 t-body-s text-mute">{question.help}</p> : null}
      <div className="mt-5 flex flex-col gap-2.5">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(question.id, opt.value)}
            className="text-left border border-hairline bg-paper px-5 py-4 hover:border-ink hover:bg-cream-soft transition-colors"
          >
            <span className="block text-[15.5px] font-medium text-ink">{opt.label}</span>
            {opt.note ? <span className="block mt-1 text-[13px] text-mute">{opt.note}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultStage({
  answers,
  result,
  onRestart,
}: {
  answers: Answers
  result: QuizResult
  onRestart: () => void
}) {
  const spec = RESULTS[result.code]
  const reasonParagraphs = buildReason(answers, result)

  // Match result slugs to live catalogue entries for image + price.
  const catalogue = useProducts({ pageSize: 60 })
  const products: Product[] = catalogue.data?.data?.items ?? []
  const matched = spec.slugs.map((slug) => products.find((p) => p.slug === slug) ?? null)
  const formatPrice = useFormatPrice()

  return (
    <div className="mt-9">
      <div className="font-mono text-[11px] tracking-widest uppercase text-coral font-medium">
        We recommend
      </div>
      <h2 className="mt-3 m-0 font-display italic font-semibold text-[clamp(28px,4.5vw,44px)] leading-[1.05] tracking-tight text-ink">
        {spec.name}
      </h2>
      <p className="mt-2 t-body text-graphite">{spec.sub}</p>

      <div className="mt-5 flex flex-col gap-3 text-[15px] leading-[1.6] text-graphite max-w-150">
        {reasonParagraphs.map((p, i) => (
          <p key={i} className="m-0">
            {p}
          </p>
        ))}
      </div>

      {/* One card per item in the set. Pants need a size, so the buttons go
          to the product page instead of straight into the bag. */}
      <div className="mt-8 flex flex-col gap-3">
        {spec.slugs.map((slug, i) => {
          const product = matched[i]
          return (
            <div
              key={slug}
              className="flex items-center justify-between gap-4 border border-hairline bg-cream-soft px-5 py-4"
            >
              <div className="min-w-0">
                <div className="text-[15.5px] font-medium text-ink">
                  {product?.name ?? slug.replace(/-/g, ' ')}
                </div>
                {product ? (
                  <div className="mt-0.5 text-[13.5px] text-graphite">
                    {formatPrice(product.salePrice ?? product.basePriceB2C)}
                  </div>
                ) : null}
              </div>
              <Button asChild variant="primary" size="md">
                <Link to={`/shop/${slug}`}>
                  Buy this set <IconArrowRight size={14} />
                </Link>
              </Button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-7 text-[13.5px] font-medium text-ink underline underline-offset-2"
      >
        Answer again
      </button>
    </div>
  )
}
