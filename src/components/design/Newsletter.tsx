// Newsletter: the design system's pill signup form, wired to our newsletter API.
import { useState, type FormEvent } from 'react'
import { useSubscribeToNewsletter, type NewsletterSource } from '@/lib/network/api/newsletter.api'

type State =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'done' }
  | { kind: 'error'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Newsletter({ source = 'footer' }: { source?: NewsletterSource }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const subscribe = useSubscribeToNewsletter()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = String(new FormData(form).get('email') ?? '').trim()
    if (!EMAIL_RE.test(email)) {
      setState({ kind: 'error', message: 'Enter a valid email' })
      return
    }
    setState({ kind: 'busy' })
    subscribe.mutate(
      { email, source },
      {
        onSuccess: () => {
          setState({ kind: 'done' })
          form.reset()
        },
        onError: () => setState({ kind: 'error', message: "That didn't go through. Try again?" }),
      },
    )
  }

  return (
    <form className="signup" onSubmit={onSubmit} noValidate>
      <label className="sr-only" htmlFor={`email-${source}`}>
        Email address
      </label>
      <input
        id={`email-${source}`}
        name="email"
        type="email"
        placeholder="Your email address"
        autoComplete="email"
        required
        aria-invalid={state.kind === 'error'}
        aria-describedby={`email-${source}-msg`}
        onChange={() => state.kind === 'error' && setState({ kind: 'idle' })}
      />
      <button className="btn btn--light" type="submit" disabled={state.kind === 'busy'}>
        <span>
          {state.kind === 'busy' ? 'Joining…' : state.kind === 'done' ? "You're in ✓" : 'Subscribe'}
        </span>
      </button>
      <p
        id={`email-${source}-msg`}
        className="signup__msg"
        role="status"
        aria-live="polite"
        data-kind={state.kind}
      >
        {state.kind === 'error'
          ? state.message
          : state.kind === 'done'
            ? 'Welcome! Look out for our next email.'
            : ''}
      </p>
    </form>
  )
}
