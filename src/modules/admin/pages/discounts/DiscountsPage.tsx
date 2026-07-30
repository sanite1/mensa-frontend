// /discounts (admin) — single-page CRUD.

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, MoreVertical, Eye, EyeOff, Trash2, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { confirm } from '@/components/ui/confirm'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import {
  useAdminDiscounts,
  useCreateDiscount,
  useDeleteDiscount,
  useUpdateDiscount,
} from '@/lib/network/api/discount.api'
import type {
  CreateDiscountInput,
  Discount,
  DiscountType,
} from '@/lib/network/types/discount.types'
import { cn, formatNaira, koboToNaira, nairaToKobo } from '@/lib/utils'

// ── Form schema ──────────────────────────────────────────────────
// `value` meaning depends on `type`: percent is 1 to 100, fixed is whole naira converted to kobo before submit.

const formSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'At least 2 characters.')
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, dash, underscore only.'),
    type: z.enum(['percent', 'fixed']),
    value: z.number().min(1, 'Must be at least 1.'),
    expiresAt: z.string().optional().or(z.literal('')),
    maxUses: z.number().int().min(1).nullable().optional(),
    isActive: z.boolean().default(true),
    description: z.string().max(200).default(''),
  })
  .refine((data) => data.type !== 'percent' || data.value <= 100, {
    message: 'Percent discounts cap at 100.',
    path: ['value'],
  })

type FormValues = z.infer<typeof formSchema>

// Preset caps for the Max uses select, `null` (sentinel '') means unlimited.
const MAX_USES_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Unlimited', value: null },
  { label: '1 (single use)', value: 1 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '250', value: 250 },
  { label: '500', value: 500 },
  { label: '1,000', value: 1000 },
]

const blank: FormValues = {
  code: '',
  type: 'percent',
  value: 10,
  expiresAt: '',
  maxUses: null,
  isActive: true,
  description: '',
}

export function DiscountsPage() {
  const query = useAdminDiscounts({ pageSize: 100 })
  const items: Discount[] = query.data?.data?.items ?? []

  const [editing, setEditing] = useState<Discount | 'new' | null>(null)

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Promotions</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Discount codes
          </h1>
          <p className="t-body-s mt-2 text-graphite">
            Percentage or fixed-amount codes. Cap usage with an expiry date or a total-uses limit.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setEditing('new')}>
          <Plus size={16} strokeWidth={2} />
          <span className="hidden sm:inline">New code</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState />
      ) : items.length === 0 ? (
        <EmptyState onCreate={() => setEditing('new')} />
      ) : (
        <DiscountsTable items={items} onEdit={(d) => setEditing(d)} />
      )}

      {/* Edit / create panel */}
      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-hairline overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="font-display italic text-[28px] text-ink">
              {editing === 'new' ? 'New discount' : editing ? `Edit ${editing.code}` : ''}
            </SheetTitle>
          </SheetHeader>
          {editing ? (
            <DiscountForm
              key={editing === 'new' ? 'new' : editing._id}
              initial={editing === 'new' ? null : editing}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  )
}

// ─── Table ───────────────────────────────────────
const TABLE_COLS = 'grid-cols-[1.4fr_1fr_1fr_1fr_1fr_0.9fr_44px]'

function DiscountsTable({ items, onEdit }: { items: Discount[]; onEdit: (d: Discount) => void }) {
  return (
    <div className="border border-hairline-soft bg-paper overflow-x-auto">
      <div className="min-w-205">
        <div
          className={cn(
            'grid items-center px-5 py-3 border-b border-hairline-soft bg-cream-soft text-[10px] uppercase tracking-[0.12em] font-medium text-mute font-mono',
            TABLE_COLS,
          )}
        >
          <div>Code</div>
          <div>Type</div>
          <div className="text-right">Value</div>
          <div className="text-right">Uses</div>
          <div>Expires</div>
          <div className="text-right">Status</div>
          <div />
        </div>
        {items.map((d, i) => (
          <Row key={d._id} d={d} isLast={i === items.length - 1} onEdit={() => onEdit(d)} />
        ))}
      </div>
    </div>
  )
}

function Row({ d, isLast, onEdit }: { d: Discount; isLast: boolean; onEdit: () => void }) {
  const update = useUpdateDiscount()
  const del = useDeleteDiscount()
  const expires = d.expiresAt
    ? new Date(d.expiresAt).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No expiry'

  return (
    <div
      className={cn(
        'grid items-center px-5 py-4 transition-colors hover:bg-cream-soft',
        TABLE_COLS,
        !isLast && 'border-b border-hairline-soft',
      )}
    >
      <button type="button" onClick={onEdit} className="text-left min-w-0 bg-transparent">
        <div className="font-mono text-ink truncate text-[14px] tracking-[0.04em]">{d.code}</div>
        {d.description ? (
          <div className="text-[12px] text-mute mt-0.5 truncate">{d.description}</div>
        ) : null}
      </button>
      <div className="text-[13px] text-graphite capitalize">{d.type}</div>
      <div className="text-right text-[14px] text-ink font-medium">
        {d.type === 'percent' ? `${d.value}%` : formatNaira(d.value)}
      </div>
      <div className="text-right text-[13px] text-graphite">
        {d.usedCount}
        {d.maxUses != null ? ` / ${d.maxUses}` : ''}
      </div>
      <div className="text-[13px] text-graphite">{expires}</div>
      <div className="text-right">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em]',
            d.isActive ? 'text-ok' : 'text-mute',
          )}
        >
          <span className={cn('rounded-full w-1.5 h-1.5', d.isActive ? 'bg-ok' : 'bg-mute')} />
          {d.isActive ? 'Active' : 'Paused'}
        </span>
      </div>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open discount actions"
              className="inline-flex h-8 w-8 items-center justify-center text-graphite hover:bg-cream rounded-sm"
            >
              <MoreVertical size={16} strokeWidth={1.6} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-paper border border-hairline-soft min-w-50"
          >
            <DropdownMenuItem onSelect={() => onEdit()} className="text-[13px] text-ink">
              <Pencil size={14} strokeWidth={1.6} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                update.mutate({
                  id: d._id,
                  payload: { isActive: !d.isActive },
                })
              }}
              className="text-[13px] text-ink"
            >
              {d.isActive ? (
                <>
                  <EyeOff size={14} strokeWidth={1.6} /> Pause code
                </>
              ) : (
                <>
                  <Eye size={14} strokeWidth={1.6} /> Activate code
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-hairline-soft" />
            <DropdownMenuItem
              onSelect={async () => {
                const ok = await confirm({
                  title: `Delete ${d.code}?`,
                  description:
                    'This cannot be undone. Existing orders that used it are unaffected.',
                  confirmLabel: 'Delete',
                  tone: 'destructive',
                })
                if (ok) del.mutate(d._id)
              }}
              className="text-[13px] text-(--err)"
            >
              <Trash2 size={14} strokeWidth={1.6} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ─── Form ────────────────────────────────────────
function DiscountForm({ initial, onDone }: { initial: Discount | null; onDone: () => void }) {
  const isEdit = !!initial
  const create = useCreateDiscount()
  const update = useUpdateDiscount()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          code: initial.code,
          type: initial.type,
          // For fixed, show value as naira in the input — easier on the eye.
          value: initial.type === 'fixed' ? koboToNaira(initial.value) : initial.value,
          expiresAt: initial.expiresAt
            ? initial.expiresAt.slice(0, 10) // yyyy-mm-dd
            : '',
          maxUses: initial.maxUses,
          isActive: initial.isActive,
          description: initial.description,
        }
      : blank,
  })

  // Re-derive value when type flips so admin gets a sane default.
  const watchedType = form.watch('type')
  useEffect(() => {
    if (!isEdit) {
      form.setValue('value', watchedType === 'percent' ? 10 : 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedType])

  const onSubmit = (values: FormValues) => {
    const payload: CreateDiscountInput = {
      code: values.code.trim(),
      type: values.type,
      value: values.type === 'fixed' ? nairaToKobo(values.value) : values.value,
      expiresAt: values.expiresAt ? values.expiresAt : null,
      maxUses: values.maxUses ?? null,
      isActive: values.isActive,
      description: values.description?.trim() ?? '',
    }
    if (isEdit && initial) {
      update.mutate({ id: initial._id, payload }, { onSuccess: () => onDone() })
    } else {
      create.mutate(payload, { onSuccess: () => onDone() })
    }
  }

  const busy = create.isPending || update.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="SWITCH10"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="font-mono tracking-[0.04em]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-11 w-full border border-(--hairline) bg-(--paper) px-3 text-[15px] text-(--ink) focus-visible:outline-none focus-visible:border-(--ink)"
                    onChange={(e) => field.onChange(e.target.value as DiscountType)}
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed (naira)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>
                  {form.watch('type') === 'percent' ? 'Percent off' : 'Naira off'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={form.watch('type') === 'percent' ? 100 : undefined}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Expires</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => {
              // Surface an off-preset cap as an extra option so editing does not silently change it.
              const current = field.value ?? null
              const hasCurrent = MAX_USES_OPTIONS.some((o) => o.value === current)
              const options = hasCurrent
                ? MAX_USES_OPTIONS
                : [
                    ...MAX_USES_OPTIONS,
                    { label: `${current?.toLocaleString()} (current)`, value: current },
                  ]
              return (
                <FormItem className="space-y-2">
                  <FormLabel>Max uses</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-11 w-full border border-(--hairline) bg-(--paper) px-3 text-[15px] text-(--ink) focus-visible:outline-none focus-visible:border-(--ink)"
                      value={current === null ? '' : String(current)}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? null : Number(e.target.value))
                      }
                    >
                      {options.map((o) => (
                        <option
                          key={o.value ?? 'unlimited'}
                          value={o.value === null ? '' : String(o.value)}
                        >
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Description (internal only)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Launch promo · April 2026" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="flex h-11 w-full border border-(--hairline) bg-(--paper) px-3 text-[15px] text-(--ink) focus-visible:outline-none focus-visible:border-(--ink)"
                  value={field.value ? 'active' : 'paused'}
                  onChange={(e) => field.onChange(e.target.value === 'active')}
                >
                  <option value="active">Active (usable at checkout)</option>
                  <option value="paused">Paused (hidden)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" variant="primary" size="lg" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create code'}
          </Button>
          <Button type="button" variant="secondary" size="lg" disabled={busy} onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="border border-hairline-soft bg-paper">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-4 border-b border-hairline-soft last:border-b-0"
        >
          <div className="h-4 bg-cream-soft animate-pulse w-1/4" />
        </div>
      ))}
    </div>
  )
}

function ErrorState() {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-err mb-3">Something went wrong</div>
      <p className="text-[14px] text-graphite m-0">
        We could not load the discount codes. Refresh and try again.
      </p>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-mute mb-3">Nothing yet</div>
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
        No discount codes yet.
      </h3>
      <Button variant="primary" size="default" className="mt-5" onClick={onCreate}>
        <Plus size={14} strokeWidth={2} /> Create the first code
      </Button>
    </div>
  )
}
