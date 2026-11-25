// /account/addresses, saved address book. Reuses the checkout AddressForm so validation stays in sync.

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, MoreVertical } from 'lucide-react'

import { MField } from '@/components/design/MField'
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
import { AccountShell } from '@/modules/platform/components/AccountShell'

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
    <AccountShell
      back={{ to: '/account', label: '← Back to account' }}
      eyebrow="Your account"
      title={<>Saved addresses.</>}
      aside={
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          <Plus size={16} strokeWidth={2} />
          Add address
        </button>
      }
    >
      {query.isLoading ? (
        <p className="text-(--mute)">Loading addresses…</p>
      ) : query.isError ? (
        <div className="ptn-card text-(--berry)">
          We could not load your saved addresses. Refresh and try again.
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState onAdd={() => setEditing('new')} />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {addresses.map((a) => (
            <AddressRow key={a._id} address={a} onEdit={() => setEditing(a)} />
          ))}
        </ul>
      )}

      {/* Add / edit panel */}
      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l-0 bg-(--white) sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="text-(length:--fs-h3) font-medium tracking-tight text-(--ink)">
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
    </AccountShell>
  )
}

// ─────────────────────────────────────────────────────────────────
function AddressRow({ address, onEdit }: { address: UserAddress; onEdit: () => void }) {
  const setDefault = useSetDefaultAddress()
  const del = useDeleteMyAddress()

  return (
    <li className="ptn-card flex justify-between gap-4">
      <button type="button" onClick={onEdit} className="text-left flex-1 min-w-0 bg-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          {address.label ? (
            <span className="text-[14px] text-(--ink) font-medium">{address.label}</span>
          ) : (
            <span className="text-[14px] text-(--ink) font-medium">{address.fullName}</span>
          )}
          {address.isDefault ? (
            <span className="rounded-full bg-(--blush) px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-(--berry)">
              Default
            </span>
          ) : null}
        </div>
        <p className="m-0 text-(length:--fs-sm) leading-relaxed text-(--mute)">
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
              className="inline-flex size-9 items-center justify-center rounded-full text-(--mute) hover:bg-(--blush) hover:text-(--ink)"
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="mform mt-6 px-4 pb-8" noValidate>
      <MField label="Label (optional)" error={form.formState.errors.label}>
        <input placeholder="Home" {...form.register('label')} />
      </MField>

      <AddressForm form={form} namePrefix="address" />

      <div className="mt-2 flex items-center gap-3">
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add address'}
        </button>
        <button type="button" className="btn btn--ghost" disabled={busy} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="ptn-card text-center">
      <p className="m-0 text-(--ink)">You have not saved an address yet.</p>
      <p className="m-0 mt-2 text-(length:--fs-sm) text-(--mute)">
        Save one here, or tick "Save this address" at checkout next time.
      </p>
      <button type="button" className="btn mt-6" onClick={onAdd}>
        <Plus size={14} strokeWidth={2} /> Add your first address
      </button>
    </div>
  )
}
