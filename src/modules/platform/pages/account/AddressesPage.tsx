// ═══════════════════════════════════════════════════════════════
// /account/addresses — saved address book.
//
// Lists the customer's saved delivery addresses with edit / delete /
// set-default actions. Add and edit use the same AddressForm fieldset
// from checkout so the validation rules stay in lock-step.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

import { AddressForm, addressSchema, emptyAddress } from '@/modules/platform/components/AddressForm'
import {
  useAddMyAddress,
  useDeleteMyAddress,
  useMyAddresses,
  useSetDefaultAddress,
  useUpdateMyAddress,
} from '@/lib/network/api/user.api'
import type { UserAddress } from '@/lib/network/types/user.types'
import { useSeo } from '@/lib/seo'
import { confirm } from '@/components/ui/confirm'

// Same shape as the checkout address fieldset, plus an optional label.
const formSchema = z.object({
  label: z.string().trim().max(40).optional().or(z.literal('')),
  address: addressSchema,
})
type FormValues = z.infer<typeof formSchema>

export function AddressesPage() {
  useSeo({ title: 'Saved addresses', noindex: true })
  const query = useMyAddresses()
  const addresses: UserAddress[] = query.data?.data?.addresses ?? []

  const [editing, setEditing] = useState<UserAddress | 'new' | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <div className="mb-6">
        <Link
          to="/account"
          className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium hover:text-(--ink)"
        >
          ← Back to account
        </Link>
      </div>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
            Your account
          </p>
          <h1 className="mt-2 font-serif italic text-4xl text-(--ink)">Saved addresses.</h1>
        </div>
        <Button variant="primary" size="lg" onClick={() => setEditing('new')}>
          <Plus size={16} strokeWidth={2} />
          Add address
        </Button>
      </header>

      {query.isLoading ? (
        <div className="text-[14px] text-(--mute)">Loading addresses…</div>
      ) : query.isError ? (
        <div className="border border-(--coral) bg-(--coral-soft) px-4 py-5 text-[14px] text-(--ink)">
          We could not load your saved addresses. Refresh and try again.
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState onAdd={() => setEditing('new')} />
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-3">
          {addresses.map((a) => (
            <AddressRow key={a._id} address={a} onEdit={() => setEditing(a)} />
          ))}
        </ul>
      )}

      {/* Add / edit panel */}
      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-(--paper) border-l border-(--hairline) overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="font-display italic text-[28px] text-ink">
              {editing === 'new'
                ? 'Add address'
                : editing
                  ? `Edit ${editing.label || editing.line1}`
                  : ''}
            </SheetTitle>
          </SheetHeader>
          {editing ? (
            <AddressEditor
              key={editing === 'new' ? 'new' : editing._id}
              initial={editing === 'new' ? null : editing}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function AddressRow({ address, onEdit }: { address: UserAddress; onEdit: () => void }) {
  const setDefault = useSetDefaultAddress()
  const del = useDeleteMyAddress()

  return (
    <li className="border border-(--hairline) bg-(--paper) p-5 flex justify-between gap-4">
      <button type="button" onClick={onEdit} className="text-left flex-1 min-w-0 bg-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          {address.label ? (
            <span className="text-[14px] text-(--ink) font-medium">{address.label}</span>
          ) : (
            <span className="text-[14px] text-(--ink) font-medium">{address.fullName}</span>
          )}
          {address.isDefault ? (
            <span className="text-[10px] uppercase tracking-[0.12em] font-medium px-2 py-0.5 bg-blush text-berry">
              Default
            </span>
          ) : null}
        </div>
        <p className="m-0 text-[13px] text-(--graphite) leading-relaxed">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
          <br />
          {address.city}, {address.state}
          <br />
          {address.phone}
        </p>
      </button>

      <div className="flex items-start">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open address actions"
              className="inline-flex h-8 w-8 items-center justify-center text-(--graphite) hover:bg-(--cream) rounded-sm"
            >
              <MoreVertical size={16} strokeWidth={1.6} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-(--paper) border border-(--hairline-soft) min-w-50"
          >
            <DropdownMenuItem onSelect={onEdit} className="text-[13px] text-(--ink)">
              Edit address
            </DropdownMenuItem>
            {!address.isDefault ? (
              <DropdownMenuItem
                onSelect={() => setDefault.mutate(address._id)}
                className="text-[13px] text-(--ink)"
              >
                Set as default
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator className="bg-(--hairline-soft)" />
            <DropdownMenuItem
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Remove this address?',
                  description:
                    'It will be deleted from your account. Past orders that used it are unaffected.',
                  confirmLabel: 'Remove',
                  tone: 'destructive',
                })
                if (ok) del.mutate(address._id)
              }}
              className="text-[13px] text-(--err)"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────
function AddressEditor({ initial, onDone }: { initial: UserAddress | null; onDone: () => void }) {
  const isEdit = !!initial
  const add = useAddMyAddress()
  const update = useUpdateMyAddress()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          label: initial.label ?? '',
          address: {
            fullName: initial.fullName,
            phone: initial.phone,
            line1: initial.line1,
            line2: initial.line2 ?? '',
            city: initial.city,
            state: initial.state,
            country: initial.country || 'NG',
            postal: initial.postal ?? '',
          },
        }
      : { label: '', address: emptyAddress },
  })

  useEffect(() => {
    // Defensive — react-hook-form already calls reset on key change, but
    // we want belt-and-braces if the parent ever forgets to remount.
    form.reset(
      initial
        ? {
            label: initial.label ?? '',
            address: {
              fullName: initial.fullName,
              phone: initial.phone,
              line1: initial.line1,
              line2: initial.line2 ?? '',
              city: initial.city,
              state: initial.state,
              country: initial.country || 'NG',
              postal: initial.postal ?? '',
            },
          }
        : { label: '', address: emptyAddress },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?._id])

  const onSubmit = (values: FormValues) => {
    const payload = {
      label: values.label?.trim() || undefined,
      ...values.address,
    }
    if (isEdit && initial) {
      update.mutate({ id: initial._id, payload }, { onSuccess: () => onDone() })
    } else {
      add.mutate(payload, { onSuccess: () => onDone() })
    }
  }

  const busy = add.isPending || update.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Label (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Home" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AddressForm form={form} namePrefix="address" />

        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" variant="primary" size="lg" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add address'}
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
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-(--hairline) bg-(--cream-soft) p-8 text-center">
      <p className="text-[14px] text-(--mute) m-0">You have not saved an address yet.</p>
      <p className="text-[13px] text-(--graphite) mt-2 m-0">
        Save one here, or tick "Save this address" at checkout next time.
      </p>
      <Button variant="primary" size="default" className="mt-5" onClick={onAdd}>
        <Plus size={14} strokeWidth={2} /> Add your first address
      </Button>
    </div>
  )
}
