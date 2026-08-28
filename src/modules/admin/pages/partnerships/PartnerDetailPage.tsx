// /partnerships/individuals/:id (admin).

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { prompt } from '@/components/ui/confirm'
import {
  useAdminPartner,
  useApprovePartner,
  useRejectPartner,
  useUpdatePartner,
} from '@/lib/network/api/partner.api'
import type { PartnerStatus } from '@/lib/network/types/partner.types'
import { formatNaira, cn } from '@/lib/utils'

export function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAdminPartner(id)
  const approve = useApprovePartner()
  const reject = useRejectPartner()
  const update = useUpdatePartner()

  const [rate, setRate] = useState<string>('')

  const partner = query.data?.data?.partner

  if (query.isLoading) {
    return <section className="px-4 md:px-6 lg:px-8 py-10 t-body-s text-mute">Loading…</section>
  }
  if (query.isError || !partner) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10">
        <Link
          to="/partnerships?tab=individuals"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
        >
          <ArrowLeft size={14} /> Back to partners
        </Link>
        <p className="t-body text-err">We could not load that partner.</p>
      </section>
    )
  }

  const isPending = partner.status === 'pending'
  const isApproved = partner.status === 'approved'
  const isActive = partner.status === 'active'
  const isSuspended = partner.status === 'suspended'

  const onApprove = () => {
    if (!id) return
    const parsedRate = rate ? Number(rate) : undefined
    approve.mutate({ id, body: { commissionRate: parsedRate } })
  }

  const onReject = async () => {
    if (!id) return
    const reason = await prompt({
      title: 'Reject application?',
      description: 'Add an internal note explaining the decision. Optional.',
      placeholder: 'Reason (optional, kept internal)',
      multiline: true,
      confirmLabel: 'Reject',
      tone: 'destructive',
    })
    if (reason === null) return
    reject.mutate({ id, body: { rejectionReason: reason.trim() || undefined } })
  }

  const onUpdateRate = () => {
    if (!id || !rate) return
    update.mutate({ id, body: { commissionRate: Number(rate) } })
  }

  const onToggleSuspend = () => {
    if (!id) return
    const nextStatus = isActive ? 'suspended' : 'active'
    update.mutate({ id, body: { status: nextStatus } })
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Link
        to="/partnerships?tab=individuals"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
      >
        <ArrowLeft size={14} /> Back to partners
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="t-eyebrow text-mute mb-3">Partner</div>
                <h1 className="m-0 font-display italic font-semibold text-[28px] leading-tight tracking-tight text-ink">
                  {partner.name}
                </h1>
              </div>
              <StatusBadge status={partner.status} />
            </div>

            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <Field label="Email" value={partner.email} />
              <Field label="Phone" value={partner.phone} />
              <Field label="Social handle" value={partner.socialHandle || '—'} />
              <Field
                label="Applied"
                value={new Date(partner.createdAt).toLocaleDateString('en-NG', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
              <Field
                label="Activated"
                value={
                  partner.activatedAt
                    ? new Date(partner.activatedAt).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'
                }
              />
              <Field label="Referral code" value={partner.referralCode || 'Not set yet'} />
            </dl>

            {partner.notes ? (
              <div className="mt-6">
                <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono mb-1.5">
                  Applicant notes
                </div>
                <p className="m-0 t-body text-graphite whitespace-pre-wrap">{partner.notes}</p>
              </div>
            ) : null}

            {partner.rejectionReason ? (
              <div className="mt-6 border-t border-hairline-soft pt-4">
                <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono mb-1.5">
                  Rejection reason
                </div>
                <p className="m-0 t-body text-graphite whitespace-pre-wrap">
                  {partner.rejectionReason}
                </p>
              </div>
            ) : null}
          </div>

          {/* Balance KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Pending" value={formatNaira(partner.pendingBalanceKobo)} />
            <Kpi label="Available" value={formatNaira(partner.availableBalanceKobo)} />
            <Kpi label="Lifetime earned" value={formatNaira(partner.lifetimeEarnedKobo)} />
            <Kpi label="Lifetime paid" value={formatNaira(partner.lifetimePaidKobo)} />
          </div>

          {partner.bankAccount ? (
            <div className="border border-hairline-soft bg-paper p-5">
              <div className="t-eyebrow text-mute mb-3">Payout account</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[14px]">
                <Field label="Account name" value={partner.bankAccount.accountName} />
                <Field label="Bank" value={partner.bankAccount.bankName} />
                <Field label="Account number" value={partner.bankAccount.accountNumber} />
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="lg:col-span-1">
          <div className="border border-hairline-soft bg-paper p-5 sticky top-4">
            <div className="t-eyebrow text-mute mb-3">Actions</div>

            {isPending ? (
              <>
                <p className="t-body-s text-graphite mb-4">
                  Approving creates a partner account, emails them an onboarding link, and lets them
                  set their password, bank, and referral code.
                </p>
                <label className="block mb-4">
                  <span className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
                    Commission rate (default 10%)
                  </span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="10"
                      className="h-11 w-full pr-10 pl-3.5 border border-hairline bg-paper text-[15px] text-ink focus-visible:outline-none focus-visible:border-ink"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute text-[14px]">
                      %
                    </span>
                  </div>
                </label>
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={onApprove}
                    disabled={approve.isPending}
                  >
                    <CheckCircle2 size={16} strokeWidth={1.8} />
                    {approve.isPending ? 'Approving…' : 'Approve & send link'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={onReject}
                    disabled={reject.isPending}
                  >
                    <XCircle size={16} strokeWidth={1.8} />
                    {reject.isPending ? 'Rejecting…' : 'Reject application'}
                  </Button>
                </div>
              </>
            ) : null}

            {isApproved ? (
              <p className="t-body-s text-graphite">
                Onboarding email sent. The partner has not completed registration yet. The link
                expires after 7 days.
              </p>
            ) : null}

            {isActive || isSuspended ? (
              <>
                <label className="block mb-4">
                  <span className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
                    Commission rate
                  </span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={rate || String(partner.commissionRate)}
                      onChange={(e) => setRate(e.target.value)}
                      className="h-11 w-full pr-10 pl-3.5 border border-hairline bg-paper text-[15px] text-ink focus-visible:outline-none focus-visible:border-ink"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute text-[14px]">
                      %
                    </span>
                  </div>
                </label>
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onUpdateRate}
                    disabled={!rate || update.isPending}
                  >
                    {update.isPending ? 'Saving…' : 'Update rate'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onToggleSuspend}
                    disabled={update.isPending}
                  >
                    {isActive ? 'Suspend partner' : 'Re-activate partner'}
                  </Button>
                </div>
              </>
            ) : null}

            {partner.status === 'rejected' ? (
              <p className="t-body-s text-mute">
                This application was declined. The applicant would need to apply again.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
        {label}
      </dt>
      <dd className="m-0 mt-1 text-ink break-words">{value}</dd>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline-soft bg-paper p-4">
      <div className="t-eyebrow text-mute text-[10.5px]">{label}</div>
      <div className="mt-1 text-ink font-display italic font-semibold text-[22px] leading-none tracking-tight">
        {value}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: PartnerStatus }) {
  const map: Record<PartnerStatus, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-cream text-mute' },
    approved: { label: 'Approved', cls: 'bg-blush text-berry' },
    active: { label: 'Active', cls: 'bg-ok/10 text-ok' },
    suspended: { label: 'Suspended', cls: 'bg-err/10 text-err' },
    rejected: { label: 'Rejected', cls: 'bg-err/10 text-err' },
  }
  const { label, cls } = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
        cls,
      )}
    >
      {label}
    </span>
  )
}
