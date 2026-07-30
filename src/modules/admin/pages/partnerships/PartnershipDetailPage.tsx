// /partnerships/:id (admin).

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { confirm } from '@/components/ui/confirm'
import {
  useAdminPartnership,
  useVerifyPartnership,
} from '@/lib/network/api/b2b.api'
import type { B2BVerificationStatus } from '@/lib/network/types/b2b.types'
import { cn } from '@/lib/utils'

const TYPE_LABEL: Record<string, string> = {
  school: 'School',
  ngo: 'NGO',
  council: 'Council',
  other: 'Other',
}

export function PartnershipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAdminPartnership(id)
  const verifyMutation = useVerifyPartnership()
  const [note, setNote] = useState('')

  const org = query.data?.data?.org

  if (query.isLoading) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10 t-body-s text-mute">Loading…</section>
    )
  }
  if (query.isError || !org) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10">
        <Link
          to="/partnerships"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
        >
          <ArrowLeft size={14} /> Partnerships
        </Link>
        <p className="t-body text-err">We could not load that partnership.</p>
      </section>
    )
  }

  const decide = async (decision: 'verified' | 'rejected') => {
    if (!id) return
    if (org.verificationStatus === decision) {
      toast.error(`Partnership is already ${decision}.`)
      return
    }
    if (decision === 'rejected' && !note.trim()) {
      const ok = await confirm({
        title: 'Reject without a note?',
        description: 'The team will not see a reason later.',
        confirmLabel: 'Reject anyway',
        tone: 'destructive',
      })
      if (!ok) return
    }
    verifyMutation.mutate({
      id,
      body: { verificationStatus: decision, verificationNote: note.trim() || undefined },
    })
  }

  const saving = verifyMutation.isPending

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Link
        to="/partnerships"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
      >
        <ArrowLeft size={14} /> Partnerships
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Org profile */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="t-eyebrow text-mute mb-3">{TYPE_LABEL[org.type] ?? org.type}</div>
                <h1 className="m-0 font-display italic font-semibold text-[28px] leading-tight tracking-tight text-ink">
                  {org.name}
                </h1>
              </div>
              <StatusBadge status={org.verificationStatus} />
            </div>

            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <Field label="Contact name" value={org.contactName} />
              <Field label="Contact email" value={org.contactEmail} />
              <Field label="Contact phone" value={org.contactPhone} />
              <Field
                label="Registration"
                value={org.registrationNumber || 'Not provided'}
              />
              <Field
                label="Applied"
                value={new Date(org.createdAt).toLocaleDateString('en-NG', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
              <Field
                label="Verified at"
                value={
                  org.verifiedAt
                    ? new Date(org.verifiedAt).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'
                }
              />
            </dl>

            {org.notes ? (
              <div className="mt-6">
                <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono mb-1.5">
                  Applicant notes
                </div>
                <p className="m-0 t-body text-graphite whitespace-pre-wrap">{org.notes}</p>
              </div>
            ) : null}

            {org.verificationNote ? (
              <div className="mt-6 border-t border-hairline-soft pt-4">
                <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono mb-1.5">
                  Admin note
                </div>
                <p className="m-0 t-body text-graphite whitespace-pre-wrap">
                  {org.verificationNote}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1">
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="t-eyebrow text-mute mb-3">Decision</div>
            <p className="t-body-s text-graphite mb-4">
              Verifying gives the org access to B2B pricing and the partnerships portal.
              Rejecting leaves them as a record but no portal access.
            </p>
            <label className="block">
              <span className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
                Note (optional)
              </span>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did the verification check find?"
                className="mt-1 flex w-full border border-hairline bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
              />
            </label>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => decide('verified')}
                disabled={saving || org.verificationStatus === 'verified'}
              >
                <CheckCircle2 size={16} strokeWidth={1.8} />
                {org.verificationStatus === 'verified' ? 'Already verified' : 'Verify partnership'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => decide('rejected')}
                disabled={saving || org.verificationStatus === 'rejected'}
              >
                <XCircle size={16} strokeWidth={1.8} />
                {org.verificationStatus === 'rejected' ? 'Already rejected' : 'Reject application'}
              </Button>
            </div>
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

function StatusBadge({ status }: { status: B2BVerificationStatus }) {
  const map: Record<B2BVerificationStatus, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-cream text-mute' },
    verified: { label: 'Verified', cls: 'bg-ok/10 text-ok' },
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
