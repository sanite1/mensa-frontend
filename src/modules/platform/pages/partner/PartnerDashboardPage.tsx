// /partner dashboard, role 'partner' only. Balances, referral link, commission and payout history.

import { useState, type ReactNode } from 'react'
import { Copy, ExternalLink, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { MField } from '@/components/design/MField'
import { AccountCard, AccountShell } from '@/modules/platform/components/AccountShell'
import {
  usePartnerDashboard,
  useRequestPayout,
  useUpdateBankAccount,
} from '@/lib/network/api/partner.api'
import type {
  PartnerBankAccount,
  PartnerCommissionRow,
  PartnerPayoutRow,
} from '@/lib/network/types/partner.types'
import { formatNaira, cn } from '@/lib/utils'
import { useSeo } from '@/lib/seo'

const COMMISSION_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-(--blush) text-(--mute)' },
  available: { label: 'Available', cls: 'bg-ok/10 text-ok' },
  paid: { label: 'Paid', cls: 'bg-(--ink) text-(--white)' },
  reversed: { label: 'Reversed', cls: 'bg-err/10 text-err' },
}

const PAYOUT_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-(--blush) text-(--mute)' },
  paid: { label: 'Paid', cls: 'bg-ok/10 text-ok' },
  rejected: { label: 'Rejected', cls: 'bg-err/10 text-err' },
}

export function PartnerDashboardPage() {
  useSeo({ title: 'Partner dashboard', noindex: true })
  const query = usePartnerDashboard()
  const payout = useRequestPayout()
  const [copied, setCopied] = useState(false)

  if (query.isLoading) {
    return (
      <main className="section section--blush min-h-[70vh]">
        <p className="wrap text-(--mute)">Loading…</p>
      </main>
    )
  }
  if (query.isError || !query.data?.data) {
    return (
      <main className="section section--blush min-h-[70vh]">
        <p className="wrap text-err">We could not load your partner dashboard.</p>
      </main>
    )
  }

  const { partner, referralUrl, minPayoutKobo, recentCommissions, payoutRequests } = query.data.data

  const isActive = partner.status === 'active'
  const hasPendingPayout = payoutRequests.some((p) => p.status === 'pending')
  const canRequest = isActive && !hasPendingPayout && partner.availableBalanceKobo >= minPayoutKobo

  const onCopy = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast.success('Referral link copied.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy. Select the link and copy manually.')
    }
  }

  const onRequestPayout = () => {
    payout.mutate()
  }

  return (
    <AccountShell
      eyebrow="Partner programme"
      title={<>Hi, {partner.name.split(' ')[0]}.</>}
      lede={
        <>
          Share your referral link, earn {partner.commissionRate}% on every paid order, cash out
          when you are ready.
        </>
      }
    >
      {partner.status === 'suspended' ? (
        <div className="mb-6 rounded-(--r-md) bg-(--white) p-5 text-(length:--fs-sm) text-err shadow-(--shadow)">
          Your partner account is suspended. New commissions will not accrue. Contact
          partnerships@mensaproducts.com if this is unexpected.
        </div>
      ) : null}

      {partner.availableBalanceKobo < 0 ? (
        <div className="mb-6 rounded-(--r-md) bg-(--white) p-5 text-(length:--fs-sm) text-(--berry) shadow-(--shadow)">
          One or more orders you earned commission on were later cancelled or refunded after we had
          already paid you. Your available balance is currently in deficit by{' '}
          <strong>{formatNaira(Math.abs(partner.availableBalanceKobo))}</strong>. New commissions
          will offset this automatically before you can cash out again.
        </div>
      ) : null}

      {/* Balance KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Available"
          value={formatBalance(partner.availableBalanceKobo)}
          tone={partner.availableBalanceKobo < 0 ? 'deficit' : 'hero'}
        />
        <Kpi label="Pending" value={formatNaira(partner.pendingBalanceKobo)} />
        <Kpi label="Lifetime earned" value={formatNaira(partner.lifetimeEarnedKobo)} />
        <Kpi label="Lifetime paid" value={formatNaira(partner.lifetimePaidKobo)} />
      </div>

      {/* Referral link */}
      <AccountCard className="mt-6">
        <span className="eyebrow">Your referral link</span>
        <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 truncate rounded-full px-5 py-3 font-mono text-[13px] text-(--ink) shadow-[inset_0_0_0_1px_var(--line)]">
            {referralUrl || 'Awaiting referral code'}
          </div>
          <button type="button" className="btn" onClick={onCopy} disabled={!referralUrl}>
            <Copy size={14} strokeWidth={1.8} />
            {copied ? 'Copied' : 'Copy link'}
          </button>
          {referralUrl ? (
            <a
              className="btn btn--ghost"
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} strokeWidth={1.8} />
              Open
            </a>
          ) : null}
        </div>
        <p className="mt-4 text-(length:--fs-sm) text-(--mute)">
          Share this anywhere — Instagram bio, TikTok, WhatsApp, group chats. Every paid order
          placed through it credits your balance once the customer receives their delivery.
        </p>
      </AccountCard>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Commissions */}
        <AccountCard className="p-0! lg:col-span-2">
          <div className="flex items-center justify-between border-b border-(--line) px-6 py-5">
            <span className="eyebrow">Recent commissions</span>
            <Small>Last {recentCommissions.length}</Small>
          </div>
          {recentCommissions.length === 0 ? (
            <p className="p-6 text-(length:--fs-sm) text-(--mute)">
              No commissions yet. Share your link and they will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-(--line)">
              {recentCommissions.map((c: PartnerCommissionRow) => {
                const badge = COMMISSION_BADGE[c.status] ?? {
                  label: c.status,
                  cls: 'bg-(--blush) text-(--mute)',
                }
                return (
                  <li key={c._id} className="flex items-center justify-between gap-3 px-6 py-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[13px] text-(--ink)">{c.orderNumber}</div>
                      <Small>
                        {new Date(c.createdAt).toLocaleDateString('en-NG', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Small>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-(--ink)">{formatNaira(c.amountKobo)}</div>
                      <Badge cls={badge.cls} className="mt-1">
                        {badge.label}
                      </Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </AccountCard>

        {/* Payouts */}
        <AccountCard className="p-0!">
          <div className="border-b border-(--line) px-6 py-5">
            <span className="eyebrow">Payouts</span>
          </div>
          <div className="flex flex-col gap-5 p-6">
            <div>
              <Small>Minimum cash out</Small>
              <div className="mt-1 text-(--ink)">{formatNaira(minPayoutKobo)}</div>
            </div>
            <button
              type="button"
              className={cn('btn w-full', !canRequest && 'btn--ghost')}
              onClick={onRequestPayout}
              disabled={!canRequest || payout.isPending}
              title={
                hasPendingPayout
                  ? 'You already have a payout in review.'
                  : partner.availableBalanceKobo < minPayoutKobo
                    ? `You need at least ${formatNaira(minPayoutKobo)} available to cash out.`
                    : undefined
              }
            >
              {payout.isPending ? 'Requesting…' : 'Request payout'}
            </button>
            {hasPendingPayout ? (
              <p className="text-(length:--fs-sm) text-(--mute)">
                You already have a payout in review. We will get it out within five working days.
              </p>
            ) : null}

            {/* Recent payouts */}
            {payoutRequests.length > 0 ? (
              <div className="border-t border-(--line) pt-5">
                <Small>Recent payouts</Small>
                <ul className="mt-3 flex flex-col gap-2">
                  {payoutRequests.map((p: PartnerPayoutRow) => {
                    const badge = PAYOUT_BADGE[p.status] ?? {
                      label: p.status,
                      cls: 'bg-(--blush) text-(--mute)',
                    }
                    return (
                      <li
                        key={p._id}
                        className="flex items-center justify-between gap-3 text-(length:--fs-sm)"
                      >
                        <div className="text-(--ink)">{formatNaira(p.amountKobo)}</div>
                        <Badge cls={badge.cls}>{badge.label}</Badge>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}

            {/* Bank account (editable) */}
            <BankAccountPanel bankAccount={partner.bankAccount} />
          </div>
        </AccountCard>
      </div>
    </AccountShell>
  )
}

function Small({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--mute)">
      {children}
    </div>
  )
}

function Badge({
  cls,
  className,
  children,
}: {
  cls: string
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]',
        cls,
        className,
      )}
    >
      {children}
    </span>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'hero' | 'deficit' }) {
  return (
    <div className="flex flex-col gap-3 rounded-(--r-md) bg-(--white) p-5 shadow-(--shadow)">
      <span className="eyebrow">{label}</span>
      <div
        className={cn(
          'text-(length:--fs-h3) leading-none tracking-tight',
          tone === 'hero' && 'text-(--berry)',
          tone === 'deficit' && 'text-coral',
          !tone && 'text-(--ink)',
        )}
      >
        {value}
      </div>
    </div>
  )
}

/** Like formatNaira but renders negatives as "-₦X" instead of "₦-X"
 *  so the minus sign reads correctly to a glanceable eye. */
function formatBalance(kobo: number): string {
  if (kobo >= 0) return formatNaira(kobo)
  return `-${formatNaira(Math.abs(kobo))}`
}

// ─── Bank account panel (read + edit) ────────────────────────────

const bankSchema = z.object({
  accountName: z.string().trim().min(2, 'Account name is required.').max(120),
  accountNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{6,12}$/, 'Account number must be 6 to 12 digits.'),
  bankName: z.string().trim().min(2, 'Bank name is required.').max(120),
})
type BankValues = z.infer<typeof bankSchema>

function BankAccountPanel({ bankAccount }: { bankAccount?: PartnerBankAccount }) {
  const [editing, setEditing] = useState(false)
  const update = useUpdateBankAccount()

  const form = useForm<BankValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountName: bankAccount?.accountName ?? '',
      accountNumber: bankAccount?.accountNumber ?? '',
      bankName: bankAccount?.bankName ?? '',
    },
    mode: 'onBlur',
  })

  const onEdit = () => {
    form.reset({
      accountName: bankAccount?.accountName ?? '',
      accountNumber: bankAccount?.accountNumber ?? '',
      bankName: bankAccount?.bankName ?? '',
    })
    setEditing(true)
  }

  const onSubmit = (values: BankValues) => {
    update.mutate(
      {
        accountName: values.accountName,
        accountNumber: values.accountNumber,
        bankName: values.bankName,
        bankCode: bankAccount?.bankCode,
      },
      {
        onSuccess: () => setEditing(false),
      },
    )
  }

  const errors = form.formState.errors

  if (!bankAccount && !editing) {
    return (
      <div className="border-t border-(--line) pt-5">
        <Small>Payout account</Small>
        <p className="mb-4 mt-2 text-(length:--fs-sm) text-(--mute)">
          No bank details on file. Add them so we can settle your payouts.
        </p>
        <button type="button" className="btn btn--ghost" onClick={onEdit}>
          Add bank account
        </button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="border-t border-(--line) pt-5">
        <div className="mb-4 flex items-center justify-between">
          <Small>Payout account</Small>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--mute) hover:text-(--ink)"
          >
            Cancel
          </button>
        </div>
        <form className="mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <MField label="Account name" error={errors.accountName}>
            <input placeholder="Ada Okeke" {...form.register('accountName')} />
          </MField>
          <MField label="Account number" error={errors.accountNumber}>
            <input
              placeholder="0123456789"
              inputMode="numeric"
              autoComplete="off"
              {...form.register('accountNumber')}
            />
          </MField>
          <MField label="Bank" error={errors.bankName}>
            <input placeholder="Access Bank" {...form.register('bankName')} />
          </MField>
          <button type="submit" className="btn w-full" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    )
  }

  // Read-only view (with edit button)
  return (
    <div className="border-t border-(--line) pt-5">
      <div className="mb-2 flex items-center justify-between">
        <Small>Paid to</Small>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit bank account"
          className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.12em] text-(--mute) hover:text-(--ink)"
        >
          <Pencil size={12} strokeWidth={1.8} />
          Edit
        </button>
      </div>
      <div className="text-(length:--fs-sm) text-(--ink)">{bankAccount?.accountName}</div>
      <div className="text-(length:--fs-xs) text-(--mute)">{bankAccount?.bankName}</div>
      <div className="font-mono text-(length:--fs-xs) text-(--mute)">
        {bankAccount?.accountNumber}
      </div>
    </div>
  )
}
