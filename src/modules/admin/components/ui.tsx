// Admin building blocks ported from the design repo (components/admin/ui.tsx).
// Markup and class names match the design; they are styled by
// styles/design/admin.css and only render inside the .a-root frame.
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

/* ------------------------------------------------------------------ buttons */

export type AdminButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'

export function AButton({
  variant = 'secondary',
  size,
  loading,
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant
  size?: 'sm'
  loading?: boolean
  icon?: ReactNode
}) {
  return (
    <button
      {...rest}
      type={type}
      disabled={rest.disabled || loading}
      className={cn('a-btn', `a-btn--${variant}`, size && `a-btn--${size}`, className)}
    >
      {loading ? <Loader2 className="a-spin" /> : icon}
      {children}
    </button>
  )
}

export function AButtonLink({
  to,
  variant = 'secondary',
  size,
  icon,
  children,
  className,
}: {
  to: string
  variant?: AdminButtonVariant
  size?: 'sm'
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Link to={to} className={cn('a-btn', `a-btn--${variant}`, size && `a-btn--${size}`, className)}>
      {icon}
      {children}
    </Link>
  )
}

export function IconButton({
  label,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      title={label}
      className={cn('a-iconbtn', className)}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ layout */

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
  back,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  lede?: ReactNode
  actions?: ReactNode
  back?: { to: string; label: string }
}) {
  return (
    <header className="a-pagehead">
      <div className="a-pagehead__text">
        {back ? (
          <Link to={back.to} className="a-back">
            <ChevronLeft /> {back.label}
          </Link>
        ) : null}
        {eyebrow ? <div className="a-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {lede ? <p className="a-lede">{lede}</p> : null}
      </div>
      {actions ? <div className="a-pagehead__actions">{actions}</div> : null}
    </header>
  )
}

export function ACard({
  title,
  actions,
  children,
  className,
  pad = true,
}: {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <section className={cn('a-card', !pad && 'a-card--flush', className)}>
      {title || actions ? (
        <div className="a-card__head">
          {title ? <h2>{title}</h2> : null}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  )
}

/** A KPI tile with an optional change against the previous period. */
export function Stat({
  label,
  value,
  previous,
  current,
  hint,
  tone,
  icon,
}: {
  label: string
  value: ReactNode
  previous?: number
  current?: number
  hint?: ReactNode
  tone?: 'warn' | 'bad'
  icon?: ReactNode
}) {
  let change: ReactNode = null
  if (previous !== undefined && current !== undefined) {
    if (previous === 0) {
      change = current > 0 ? <span className="a-delta a-delta--up">New</span> : null
    } else {
      const pct = ((current - previous) / previous) * 100
      const up = pct >= 0
      change = (
        <span className={cn('a-delta', up ? 'a-delta--up' : 'a-delta--down')}>
          {up ? <ArrowUpRight /> : <ArrowDownRight />}
          {Math.abs(pct).toFixed(Math.abs(pct) < 10 ? 1 : 0)}%
        </span>
      )
    }
  }
  return (
    <div className={cn('a-stat', tone && `a-stat--${tone}`)}>
      <div className="a-stat__label">
        {icon}
        {label}
      </div>
      <div className="a-stat__value">{value}</div>
      <div className="a-stat__foot">
        {change}
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  )
}

export function Money({
  kobo,
  className,
}: {
  kobo: number | null | undefined
  className?: string
}) {
  return <span className={cn('a-num', className)}>{kobo == null ? '—' : formatNaira(kobo)}</span>
}

/* ------------------------------------------------------------------ status */

export type BadgeTone = 'grey' | 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'rose'

export function Badge({
  tone = 'grey',
  children,
  dot = true,
}: {
  tone?: BadgeTone
  children: ReactNode
  dot?: boolean
}) {
  return (
    <span className={cn('a-badge', `a-badge--${tone}`, dot && 'a-badge--dot')}>{children}</span>
  )
}

/** A bar showing stock against three times its reorder point. */
export function StockMeter({ stock, lowStockAt }: { stock: number; lowStockAt: number }) {
  const full = Math.max(lowStockAt * 3, 1)
  const pct = Math.min(100, (Math.max(0, stock) / full) * 100)
  const level = stock <= 0 ? 'out' : stock <= lowStockAt ? 'low' : 'ok'
  return (
    <span className={cn('a-meter', `a-meter--${level}`)} aria-hidden>
      <span style={{ width: `${pct}%` }} />
      <i style={{ left: `${(lowStockAt / full) * 100}%` }} />
    </span>
  )
}

export function Avatar({ name, size = 32, tone }: { name: string; size?: number; tone?: number }) {
  const hue = tone ?? [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 5
  return (
    <span
      className={cn('a-avatar', `a-avatar--${hue}`)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()}
    </span>
  )
}

/* ------------------------------------------------------------------ forms */

export function AField({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: string
  children: (id: string) => ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('a-field', error && 'is-invalid', className)}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {error ? (
        <p className="a-field__error">
          <AlertCircle /> {error}
        </p>
      ) : hint ? (
        <p className="a-field__hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function AInput({
  className,
  prefix,
  ...p
}: InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  return prefix ? (
    <span className={cn('a-input a-input--affix', className)}>
      <span className="a-input__prefix">{prefix}</span>
      <input {...p} />
    </span>
  ) : (
    <input {...p} className={cn('a-input', className)} />
  )
}

export function ATextarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn('a-input a-textarea', className)} />
}

export function ASelect({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...p} className={cn('a-input a-select', className)}>
      {children}
    </select>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
}) {
  return (
    <label className="a-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-toggle__track" aria-hidden>
        <span />
      </span>
      {label}
    </label>
  )
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="a-search">
      <Search />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value ? (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search">
          <X />
        </button>
      ) : null}
    </label>
  )
}

/** Pill tabs used as filters. */
export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T
  onChange: (v: T) => void
  tabs: { value: T; label: ReactNode; count?: number }[]
}) {
  return (
    <div className="a-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          className={cn('a-tab', value === t.value && 'is-active')}
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {t.count !== undefined ? <span className="a-tab__count">{t.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function Pagination({
  page,
  pages,
  total,
  onPage,
  noun = 'results',
}: {
  page: number
  pages: number
  total: number
  onPage: (p: number) => void
  noun?: string
}) {
  if (total === 0) return null
  return (
    <div className="a-pager">
      <span>
        {total.toLocaleString()} {noun}
      </span>
      {pages > 1 ? (
        <div>
          <IconButton label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft />
          </IconButton>
          <span className="a-num">
            {page} / {pages}
          </span>
          <IconButton label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            <ChevronRight />
          </IconButton>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ states */

export function Empty({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="a-empty">
      {icon ? <div className="a-empty__icon">{icon}</div> : null}
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  )
}

export function ErrorNote({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  if (!message) return null
  return (
    <div className="a-alert a-alert--error" role="alert">
      <AlertCircle />
      <span>{message}</span>
      {onRetry ? (
        <AButton size="sm" variant="ghost" onClick={onRetry}>
          Try again
        </AButton>
      ) : null}
    </div>
  )
}

export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode
  tone?: 'info' | 'warn' | 'error'
}) {
  return (
    <div className={cn('a-alert', `a-alert--${tone}`)}>
      {tone === 'info' ? <Info /> : <AlertCircle />}
      <span>{children}</span>
    </div>
  )
}

export function Skeleton({
  h = 16,
  w = '100%',
  r = 8,
}: {
  h?: number
  w?: number | string
  r?: number
}) {
  return <span className="a-skel" style={{ height: h, width: w, borderRadius: r }} />
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="a-tableskel">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ gridTemplateColumns: `2fr repeat(${cols - 1}, 1fr)` }}>
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} h={12} w={j === 0 ? '70%' : '50%'} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ dialog */

export function ADialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={cn('a-dialog', wide && 'a-dialog--wide')}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {open ? (
        <div className="a-dialog__body">
          <div className="a-dialog__head">
            <div>
              <h2>{title}</h2>
              {description ? <p>{description}</p> : null}
            </div>
            <IconButton label="Close" onClick={onClose}>
              <X />
            </IconButton>
          </div>
          {children}
          {footer ? <div className="a-dialog__foot">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  )
}

/* ------------------------------------------------------------------ time */

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
export function ago(iso: string | Date): string {
  const s = (new Date(iso).getTime() - Date.now()) / 1000
  const a = Math.abs(s)
  if (a < 45) return 'just now'
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day')
  return shortDate(iso)
}
export const shortDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
export const dateTime = (iso: string | Date): string =>
  new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
