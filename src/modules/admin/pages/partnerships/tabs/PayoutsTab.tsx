// Payouts tab inside /partnerships (admin). Admin pays manually then records the reference here to mark paid.
// Rejection puts commissions back to 'available' so the partner can re-request.

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { prompt } from '@/components/ui/confirm'
import {
  useAdminPayouts,
  useMarkPayoutPaid,
  useRejectPayout,
  type AdminListPayoutsParams,
} from '@/lib/network/api/partner.api'
import type { AdminPayoutListItem, PartnerPayoutStatus } from '@/lib/network/types/partner.types'
import { formatNaira, cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const STATUS_FILTERS: { id: 'all' | PartnerPayoutStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

const PAGE_SIZE = 24

export function PayoutsTab() {
  const [status, setStatus] = useState<'all' | PartnerPayoutStatus>('pending')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)

  const params: AdminListPayoutsParams = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, page],
  )

  const query = useAdminPayouts(params)
  const items: AdminPayoutListItem[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  return (
    <div>
      <div className="flex items-center gap-3 md:gap-4 flex-wrap mb-5 md:mb-6">
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStatus(f.id)
                setPage(1)
              }}
              className={cn(
                'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                status === f.id
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-graphite hover:bg-cream-soft',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-hairline-soft bg-paper overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left border-b border-hairline-soft">
              <Th>Partner</Th>
              <Th>Bank</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th>Requested</Th>
              <Th>Reference</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-mute t-body-s">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-mute t-body-s">
                  No payout requests.
                </td>
              </tr>
            ) : (
              items.map((p: AdminPayoutListItem) => (
                <tr
                  key={p._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft align-top"
                >
                  <Td>
                    <div className="text-ink font-medium">{p.partnerName}</div>
                    <div className="text-[12px] text-graphite">{p.partnerEmail}</div>
                  </Td>
                  <Td>
                    <div className="text-[13px] text-ink">{p.bankAccountSnapshot.accountName}</div>
                    <div className="text-[12px] text-graphite">
                      {p.bankAccountSnapshot.bankName}
                    </div>
                    <div className="text-[12px] font-mono text-mute">
                      {p.bankAccountSnapshot.accountNumber}
                    </div>
                  </Td>
                  <Td className="text-right font-medium">{formatNaira(p.amountKobo)}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="text-mute text-[12px]">
                    {new Date(p.requestedAt).toLocaleString('en-NG', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Td>
                  <Td className="text-[12px] text-graphite">{p.paymentReference ?? '—'}</Td>
                  <Td>
                    {p.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setOpenId(p._id)}
                        >
                          <Check size={14} strokeWidth={1.8} /> Mark paid
                        </Button>
                        <RejectButton payoutId={p._id} />
                      </div>
                    ) : null}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-[12px] uppercase tracking-widest font-medium text-mute">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </div>
          <div className="inline-flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((n: number) => Math.max(1, n - 1))}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((n: number) => n + 1)}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {openId ? <MarkPaidModal payoutId={openId} onClose={() => setOpenId(null)} /> : null}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-cream text-mute' },
    paid: { label: 'Paid', cls: 'bg-ok/10 text-ok' },
    rejected: { label: 'Rejected', cls: 'bg-err/10 text-err' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-cream text-mute' }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
        cls,
      )}
    >
      {label}
    </span>
  )
}

function RejectButton({ payoutId }: { payoutId: string }) {
  const reject = useRejectPayout()
  const onClick = async () => {
    const note = await prompt({
      title: 'Reject this payout?',
      description: 'Add a short note the partner will see. Optional.',
      placeholder: 'Reason (shown to partner)',
      multiline: true,
      confirmLabel: 'Reject',
      tone: 'destructive',
    })
    if (note === null) return
    reject.mutate({ id: payoutId, body: { adminNote: note.trim() || undefined } })
  }
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onClick}
      disabled={reject.isPending}
    >
      <X size={14} strokeWidth={1.8} /> Reject
    </Button>
  )
}

function MarkPaidModal({ payoutId, onClose }: { payoutId: string; onClose: () => void }) {
  const mutation = useMarkPayoutPaid()
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')

  const onConfirm = () => {
    if (!reference.trim()) {
      toast.error('Payment reference is required.')
      return
    }
    mutation.mutate(
      {
        id: payoutId,
        body: { paymentReference: reference.trim(), adminNote: note.trim() || undefined },
      },
      {
        onSuccess: () => onClose(),
      },
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-paper border border-hairline p-6"
      >
        <div className="t-eyebrow text-mute mb-3">Mark payout paid</div>
        <h2 className="m-0 font-display italic font-semibold text-[24px] text-ink leading-tight tracking-tight">
          Record the bank reference
        </h2>
        <p className="mt-3 t-body-s text-graphite">
          Pay the partner outside the system first, then paste the transaction reference here. This
          locks the commissions in as paid.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          <label className="block">
            <span className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              Payment reference
            </span>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="TRX-2026-04-21-001"
              className="mt-1 flex h-11 w-full border border-hairline bg-paper px-3.5 py-2 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              Internal note (optional)
            </span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything to remember about this payout"
              className="mt-1 flex w-full border border-hairline bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Spinner size={14} /> Saving…
              </>
            ) : (
              'Mark paid'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[11px] uppercase tracking-widest font-medium text-mute font-mono',
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}
