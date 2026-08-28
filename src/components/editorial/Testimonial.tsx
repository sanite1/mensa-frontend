// Testimonial — italic Newsreader pull quote with name and location byline.
import { Stars } from '@/components/shop/Stars'
import { cn } from '@/lib/utils'

interface TestimonialProps {
  quote: string
  name: string
  location: string
  /** Background tone. paper sits on a cream surface, blush is the accent. */
  tone?: 'paper' | 'blush'
  /** Override the 5-star rating if you have per-quote data. */
  rating?: number
}

// Blush tone is a colour blend with no theme token, hence the one arbitrary value class.
const TONE = {
  paper: {
    surface: 'bg-paper border border-hairline-soft',
    text: 'text-ink',
    starColor: 'var(--ink)',
    mutedColor: 'var(--mute)',
    mutedText: 'text-mute',
  },
  blush: {
    surface: 'bg-blush',
    text: 'text-berry',
    starColor: 'var(--berry)',
    mutedColor: 'rgba(139,31,53,0.7)',
    mutedText: 'text-[rgba(139,31,53,0.7)]',
  },
} as const

export function Testimonial({
  quote,
  name,
  location,
  tone = 'paper',
  rating = 5,
}: TestimonialProps) {
  const t = TONE[tone]
  return (
    <figure className={cn('m-0 p-7 flex flex-col gap-4', t.surface)}>
      <Stars value={rating} size={13} color={t.starColor} mutedColor={t.mutedColor} />
      <blockquote
        className={cn(
          'm-0 font-display italic font-medium text-[22px] leading-[1.3] tracking-[-0.012em]',
          t.text,
        )}
      >
        {`"${quote}"`}
      </blockquote>
      <figcaption className="flex flex-col gap-0.5">
        <span className={cn('font-sans text-[13px] font-medium', t.text)}>{name}</span>
        <span className={cn('font-mono text-[11px] tracking-[0.12em] uppercase', t.mutedText)}>
          {location}
        </span>
      </figcaption>
    </figure>
  )
}
