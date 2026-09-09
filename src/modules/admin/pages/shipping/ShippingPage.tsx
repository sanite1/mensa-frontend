// /shipping (admin) — delivery options and the free delivery threshold.
// The admin owns the whole list: names, prices, ETAs and state coverage.
// Saved atomically as one settings document.

import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { confirm } from '@/components/ui/confirm'
import {
  useShippingSettings,
  useUpdateShippingSettings,
  type ShippingOption,
} from '@/lib/network/api/shipping.api'
import { NG_STATES } from '@/data/nigerian-states'
import { cn } from '@/lib/utils'

interface Draft {
  freeDeliveryEnabled: boolean
  freeDeliveryNaira: string
  options: ShippingOption[]
}

function newOption(sortOrder: number): ShippingOption {
  return {
    id: '',
    name: '',
    feeKobo: 0,
    etaMinDays: 2,
    etaMaxDays: 5,
    coverage: 'all',
    states: [],
    enabled: true,
    sortOrder,
  }
}

export function ShippingPage() {
  const query = useShippingSettings()
  const save = useUpdateShippingSettings()
  const settings = query.data?.data

  const [draft, setDraft] = useState<Draft | null>(null)

  // Seed the draft once the settings arrive; a manual Reset re seeds it.
  useEffect(() => {
    if (settings && draft === null) {
      setDraft({
        freeDeliveryEnabled:
          settings.freeDeliveryThresholdKobo != null && settings.freeDeliveryThresholdKobo > 0,
        freeDeliveryNaira: settings.freeDeliveryThresholdKobo
          ? String(settings.freeDeliveryThresholdKobo / 100)
          : '',
        options: settings.options.map((o) => ({ ...o })),
      })
    }
  }, [settings, draft])

  const patchOption = (index: number, patch: Partial<ShippingOption>) => {
    setDraft((d) => {
      if (!d) return d
      const options = d.options.map((o, i) => (i === index ? { ...o, ...patch } : o))
      return { ...d, options }
    })
  }

  const move = (index: number, dir: -1 | 1) => {
    setDraft((d) => {
      if (!d) return d
      const target = index + dir
      if (target < 0 || target >= d.options.length) return d
      const options = [...d.options]
      ;[options[index], options[target]] = [options[target], options[index]]
      return { ...d, options }
    })
  }

  const remove = async (index: number) => {
    if (!draft) return
    const opt = draft.options[index]
    const ok = await confirm({
      title: `Remove "${opt.name || 'this option'}"?`,
      description: 'Customers will no longer see it at checkout once you save.',
      confirmLabel: 'Remove',
      tone: 'destructive',
    })
    if (!ok) return
    setDraft((d) => (d ? { ...d, options: d.options.filter((_, i) => i !== index) } : d))
  }

  const onSave = () => {
    if (!draft) return

    for (const o of draft.options) {
      if (o.name.trim().length < 2) {
        toast.error('Every delivery option needs a name.')
        return
      }
      if (o.etaMaxDays < o.etaMinDays) {
        toast.error(`"${o.name}": the latest delivery day cannot be before the earliest.`)
        return
      }
      if (o.coverage === 'states' && o.states.length === 0) {
        toast.error(`"${o.name}": pick at least one state, or switch it to all states.`)
        return
      }
    }
    if (!draft.options.some((o) => o.enabled)) {
      toast.error('At least one delivery option must be enabled.')
      return
    }

    const thresholdNaira = Number(draft.freeDeliveryNaira)
    const freeDeliveryThresholdKobo =
      draft.freeDeliveryEnabled && thresholdNaira > 0 ? Math.round(thresholdNaira * 100) : null
    if (draft.freeDeliveryEnabled && freeDeliveryThresholdKobo == null) {
      toast.error('Enter the order amount that qualifies for free delivery.')
      return
    }

    save.mutate(
      {
        freeDeliveryThresholdKobo,
        options: draft.options.map((o, i) => ({ ...o, name: o.name.trim(), sortOrder: i })),
      },
      { onSuccess: () => setDraft(null) },
    )
  }

  // States no enabled option covers, so gaps are always visible.
  const uncovered = (() => {
    if (!draft) return []
    const enabled = draft.options.filter((o) => o.enabled)
    if (enabled.some((o) => o.coverage === 'all')) return []
    const covered = new Set(enabled.flatMap((o) => o.states))
    return NG_STATES.filter((s) => !covered.has(s))
  })()

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Store</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Shipping
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            The delivery options customers see at checkout. Each option has its own price, delivery
            window and state coverage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setDraft(null)}
            disabled={!draft || save.isPending}
          >
            <RotateCcw size={14} strokeWidth={1.8} />
            Reset
          </Button>
          <Button
            type="button"
            variant="ink"
            size="md"
            onClick={onSave}
            disabled={!draft || save.isPending}
          >
            {save.isPending ? (
              <>
                <Spinner size={14} /> Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>

      {query.isLoading || !draft ? (
        <div className="border border-hairline-soft bg-paper px-4 py-10 text-center t-body-s text-mute">
          Loading…
        </div>
      ) : (
        <>
          {settings?.isDefault ? (
            <div className="mb-5 border border-hairline bg-cream-soft px-4 py-3 text-[13px] text-graphite">
              These are the built in defaults. Save once to take ownership of them.
            </div>
          ) : null}

          {uncovered.length > 0 ? (
            <div className="mb-5 border border-coral bg-blush px-4 py-3 text-[13px] text-ink">
              <span className="font-medium">
                {uncovered.length} state{uncovered.length === 1 ? ' has' : 's have'} no delivery
                option:
              </span>{' '}
              {uncovered.join(', ')}. Customers there cannot check out.
            </div>
          ) : null}

          {/* Free delivery threshold */}
          <div className="border border-hairline-soft bg-paper p-5 md:p-6 mb-5">
            <div className="t-eyebrow text-mute mb-3">Free delivery</div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.freeDeliveryEnabled}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, freeDeliveryEnabled: e.target.checked } : d))
                }
                className="h-4 w-4 accent-(--pink)"
              />
              <span className="text-[14px] text-ink">
                Deliver free when the order subtotal reaches a minimum
              </span>
            </label>
            {draft.freeDeliveryEnabled ? (
              <div className="mt-4 flex items-center gap-3">
                <NairaInput
                  value={draft.freeDeliveryNaira}
                  onChange={(v) => setDraft((d) => (d ? { ...d, freeDeliveryNaira: v } : d))}
                  placeholder="50000"
                />
                <span className="text-[13px] text-mute">
                  Orders at or above this amount ship free on every option.
                </span>
              </div>
            ) : null}
          </div>

          {/* Options */}
          <div className="flex flex-col gap-4">
            {draft.options.map((opt, index) => (
              <OptionCard
                key={opt.id || `new-${index}`}
                option={opt}
                index={index}
                count={draft.options.length}
                onPatch={(patch) => patchOption(index, patch)}
                onMove={(dir) => move(index, dir)}
                onRemove={() => remove(index)}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            className="mt-5"
            onClick={() =>
              setDraft((d) =>
                d ? { ...d, options: [...d.options, newOption(d.options.length)] } : d,
              )
            }
          >
            <Plus size={14} strokeWidth={1.8} />
            Add delivery option
          </Button>
        </>
      )}
    </section>
  )
}

// ─── Option card ─────────────────────────────────────────────────

function OptionCard({
  option,
  index,
  count,
  onPatch,
  onMove,
  onRemove,
}: {
  option: ShippingOption
  index: number
  count: number
  onPatch: (patch: Partial<ShippingOption>) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  return (
    <div
      className={cn(
        'border bg-paper p-5 md:p-6',
        option.enabled ? 'border-hairline-soft' : 'border-hairline-soft opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={option.enabled}
            onChange={(e) => onPatch({ enabled: e.target.checked })}
            className="h-4 w-4 accent-(--pink)"
          />
          <span className="text-[12px] uppercase tracking-widest font-medium text-mute font-mono">
            {option.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
        <div className="inline-flex items-center gap-1">
          <IconAction label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp size={14} strokeWidth={1.6} />
          </IconAction>
          <IconAction label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
            <ArrowDown size={14} strokeWidth={1.6} />
          </IconAction>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove option"
            className="inline-flex h-8 w-8 items-center justify-center text-mute hover:text-err hover:bg-blush rounded-sm"
          >
            <Trash2 size={14} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Name shown at checkout" className="lg:col-span-2">
          <input
            type="text"
            value={option.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            placeholder="Nationwide delivery"
            className="h-11 w-full px-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </Field>
        <Field label="Price (₦)">
          <NairaInput
            value={option.feeKobo === 0 ? '0' : String(option.feeKobo / 100)}
            onChange={(v) => onPatch({ feeKobo: Math.max(0, Math.round(Number(v || 0) * 100)) })}
            placeholder="2500"
          />
        </Field>
        <Field label="Delivery window (days)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={60}
              value={option.etaMinDays}
              onChange={(e) => onPatch({ etaMinDays: clampInt(e.target.value, 0, 60) })}
              aria-label="Earliest day"
              className="h-11 w-full px-3 border border-hairline bg-paper text-[14px] text-ink focus-visible:outline-none focus-visible:border-ink"
            />
            <span className="text-[13px] text-mute shrink-0">to</span>
            <input
              type="number"
              min={0}
              max={90}
              value={option.etaMaxDays}
              onChange={(e) => onPatch({ etaMaxDays: clampInt(e.target.value, 0, 90) })}
              aria-label="Latest day"
              className="h-11 w-full px-3 border border-hairline bg-paper text-[14px] text-ink focus-visible:outline-none focus-visible:border-ink"
            />
          </div>
        </Field>
      </div>

      {/* Coverage */}
      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
          Coverage
        </div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
          {(
            [
              { id: 'all', label: 'All states' },
              { id: 'states', label: 'Selected states' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPatch({ coverage: c.id })}
              className={cn(
                'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                option.coverage === c.id
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-graphite hover:bg-cream-soft',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {option.coverage === 'states' ? (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2">
            {NG_STATES.map((state) => {
              const checked = option.states.includes(state)
              return (
                <label
                  key={state}
                  className="flex items-center gap-2 cursor-pointer select-none text-[13px] text-ink"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onPatch({
                        states: e.target.checked
                          ? [...option.states, state]
                          : option.states.filter((s) => s !== state),
                      })
                    }
                    className="h-3.5 w-3.5 accent-(--pink)"
                  />
                  {state}
                </label>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── Small building blocks ───────────────────────────────────────

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}

function NairaInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative w-full max-w-45">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-mute">₦</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full pl-7 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
      />
    </div>
  )
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center text-mute hover:text-ink hover:bg-cream rounded-sm disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function clampInt(raw: string, min: number, max: number): number {
  const n = Math.round(Number(raw))
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}
