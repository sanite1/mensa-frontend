// /partner dashboard, role 'partner' only. Balances, referral link, commission and payout history.

import { useState } from 'react'
import { Copy, ExternalLink, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

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
  pending: { label: 'Pending', cls: 'bg-cream text-mute' },
  available: { label: 'Available', cls: 'bg-ok/10 text-ok' },
  paid: { label: 'Paid', cls: 'bg-ink text-paper' },
  reversed: { label: 'Reversed', cls: 'bg-err/10 text-err' },
}

const PAYOUT_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-cream text-mute' },
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
      <section className="px-4 md:px-6 lg:px-8 py-10 t-body-s text-mute">Loading…</section>
    )
  }
  if (query.isError || !query.data?.data) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10">
        <p className="t-body text-err">We could not load your partner dashboard.</p>
      </section>
    )
  }

  const {
    partner,
    referralUrl,
    minPayoutKobo,
    recentCommissions,
    payoutRequests,
  } = query.data.data

  const isActive = partner.status === 'active'
  const hasPendingPayout = payoutRequests.some((p) => p.status === 'pending')
  const canRequest =
    isActive &&
    !hasPendingPayout &&
    partner.availableBalanceKobo >= minPayoutKobo

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
    <section className="px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-14 max-w-6xl mx-auto">
      <div className="t-eyebrow text-mute mb-3">Partner programme</div>
      <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,52px)] leading-[1.02] tracking-tight text-ink">
        Hi, {partner.name.split(' ')[0]}.
      </h1>
      <p className="t-body-l mt-3 text-graphite max-w-150">
        Share your referral link, earn {partner.commissionRate}% on every paid order, cash out
        when you are ready.
      </p>

      {partner.status === 'suspended' ? (
        <div className="mt-6 border border-err/40 bg-err/5 p-4 text-err t-body-s">
          Your partner account is suspended. New commissions will not accrue. Contact
          partnerships@mensaproducts.com if this is unexpected.
        </div>
      ) : null}

      {partner.availableBalanceKobo < 0 ? (
        <div className="mt-6 border border-coral/50 bg-blush p-4 text-berry t-body-s">
          One or more orders you earned commission on were later cancelled or refunded after we
          had already paid you. Your available balance is currently in deficit by{' '}
          <strong>{formatNaira(Math.abs(partner.availableBalanceKobo))}</strong>. New commissions
          will offset this automatically before you can cash out again.
        </div>
      ) : null}

      {/* Balance KPIs */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
      <div className="mt-8 border border-hairline-soft bg-paper p-5 md:p-6">
        <div className="t-eyebrow text-mute mb-3">Your referral link</div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 min-w-0 border border-hairline bg-cream-soft px-4 py-3 font-mono text-[13px] text-ink truncate">
            {referralUrl || 'Awaiting referral code'}
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onCopy}
            disabled={!referralUrl}
          >
            <Copy size={14} strokeWidth={1.8} />
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          {referralUrl ? (
            <Button asChild variant="secondary" size="md">
              <a href={referralUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} strokeWidth={1.8} />
                Open
              </a>
            </Button>
          ) : null}
        </div>
        <p className="mt-3 t-body-s text-mute">
          Share this anywhere — Instagram bio, TikTok, WhatsApp, group chats. Every paid order
          placed through it credits your balance once the customer receives their delivery.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Commissions */}
        <div className="lg:col-span-2 border border-hairline-soft bg-paper">
          <div className="flex items-center justify-between px-5 py-4 border-b border-hairline-soft">
            <div className="t-eyebrow text-mute">Recent commissions</div>
            <div className="text-[11px] uppercase tracking-widest font-medium text-mute">
              Last {recentCommissions.length}
            </div>
          </div>
          {recentCommissions.length === 0 ? (
            <div className="p-6 t-body-s text-mute">
              No commissions yet. Share your link and they will show up here.
            </div>
          ) : (
            <ul className="divide-y divide-hairline-soft">
              {recentCommissions.map((c: PartnerCommissionRow) => {
                const badge = COMMISSION_BADGE[c.status] ?? {
                  label: c.status,
                  cls: 'bg-cream text-mute',
                }
                return (
                  <li
                    key={c._id}
                    className="px-5 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-mono text-ink">{c.orderNumber}</div>
                      <div className="text-[11px] uppercase tracking-widest font-medium text-mute">
                        {new Date(c.createdAt).toLocaleDateString('en-NG', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-medium text-ink">
                        {formatNaira(c.amountKobo)}
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm mt-1',
                          badge.cls,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Payouts */}
        <div className="border border-hairline-soft bg-paper">
          <div className="px-5 py-4 border-b border-hairline-soft">
            <div className="t-eyebrow text-mute">Payouts</div>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-medium text-mute mb-1">
                Minimum cash out
              </div>
              <div className="text-[14px] text-ink">{formatNaira(minPayoutKobo)}</div>
            </div>
            <Button
              type="button"
              variant={canRequest ? 'primary' : 'secondary'}
              size="md"
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
            </Button>
            {hasPendingPayout ? (
              <p className="t-body-s text-mute">
                You already have a payout in review. We will get it out within five working days.
              </p>
            ) : null}

            {/* Recent payouts */}
            {payoutRequests.length > 0 ? (
              <div className="border-t border-hairline-soft pt-4">
                <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
                  Recent payouts
                </div>
                <ul className="flex flex-col gap-2">
                  {payoutRequests.map((p: PartnerPayoutRow) => {
                    const badge = PAYOUT_BADGE[p.status] ?? {
                      label: p.status,
                      cls: 'bg-cream text-mute',
                    }
                    return (
                      <li
                        key={p._id}
                        className="flex items-center justify-between gap-3 text-[13px]"
                      >
                        <div className="text-ink">{formatNaira(p.amountKobo)}</div>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
                            badge.cls,
                          )}
                        >
                          {badge.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}

            {/* Bank account (editable) */}
            <BankAccountPanel bankAccount={partner.bankAccount} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'hero' | 'deficit'
}) {
  return (
    <div
      className={cn(
        'border p-4 md:p-5 flex flex-col gap-2',
        tone === 'hero' && 'bg-blush border-pink/40',
        tone === 'deficit' && 'bg-blush border-coral/50',
        !tone && 'bg-paper border-hairline-soft',
      )}
    >
      <div className="t-eyebrow text-mute text-[10.5px]">{label}</div>
      <div
        className={cn(
          'font-display italic font-semibold text-[clamp(22px,3vw,30px)] leading-none tracking-tight',
          tone === 'hero' && 'text-berry',
          tone === 'deficit' && 'text-coral',
          !tone && 'text-ink',
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

function BankAccountPanel({
  bankAccount,
}: {
  bankAccount?: PartnerBankAccount
}) {
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

  if (!bankAccount && !editing) {
    return (
      <div className="border-t border-hairline-soft pt-4">
        <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
          Payout account
        </div>
        <p className="t-body-s text-mute mb-3">
          No bank details on file. Add them so we can settle your payouts.
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
          Add bank account
        </Button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="border-t border-hairline-soft pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
            Payout account
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-[11px] uppercase tracking-widest font-medium text-mute hover:text-ink"
          >
            Cancel
          </button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Account name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ada Okeke" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Account number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0123456789"
                      inputMode="numeric"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Bank</FormLabel>
                  <FormControl>
                    <Input placeholder="Access Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="primary" size="sm" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  // Read-only view (with edit button)
  return (
    <div className="border-t border-hairline-soft pt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
          Paid to
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit bank account"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-medium text-mute hover:text-ink"
        >
          <Pencil size={12} strokeWidth={1.8} />
          Edit
        </button>
      </div>
      <div className="text-[13px] text-ink">{bankAccount?.accountName}</div>
      <div className="text-[12px] text-graphite">{bankAccount?.bankName}</div>
      <div className="text-[12px] font-mono text-mute">{bankAccount?.accountNumber}</div>
    </div>
  )
}
