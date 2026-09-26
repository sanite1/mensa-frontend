// /customers/:id (admin) — one customer. Account holders are keyed by user
// id, guests by email, so guest buyers get a page too.

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, UserRound } from 'lucide-react'

import { useAdminCustomer, type AdminCustomerDetailOrder } from '@/lib/network/api/admin.api'
import type { UserAddress } from '@/lib/network/types/user.types'
import { ClickableRow } from '@/modules/admin/components/ClickableRow'
import { formatNaira, cn } from '@/lib/utils'

const ROLE_LABEL: Record<string, string> = {
  customer: 'Customer',
  admin: 'Admin',
  b2b_admin: 'B2B admin',
  b2b_member: 'B2B member',
  partner: 'Partner',
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAdminCustomer(id)
  const customer = query.data?.data?.customer

  if (query.isLoading) {
    return <section className="px-4 md:px-6 lg:px-8 py-10 t-body-s text-mute">Loading…</section>
  }

  if (query.isError || !customer) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10">
        <BackLink />
        <p className="t-body text-err">We could not load that customer.</p>
      </section>
    )
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <BackLink />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="t-eyebrow text-mute mb-3">Profile</div>
            <h1 className="m-0 font-display italic font-semibold text-[28px] leading-tight tracking-tight text-ink">
              {customer.name}
            </h1>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest font-medium">
              {customer.hasAccount ? (
                customer.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-ok">
                    <CheckCircle2 size={14} /> Account, verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-mute">
                    <XCircle size={14} /> Account, unverified
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-mute">
                  <UserRound size={14} /> Guest checkout, no account
                </span>
              )}
            </div>

            <dl className="mt-5 m-0 flex flex-col gap-3">
              <Field label="Email" value={customer.email} />
              <Field label="Phone" value={customer.phone || '—'} />
              {customer.hasAccount && customer.role ? (
                <Field label="Role" value={ROLE_LABEL[customer.role] ?? customer.role} />
              ) : null}
              <Field
                label={customer.hasAccount ? 'Joined' : 'First order'}
                value={new Date(customer.createdAt).toLocaleDateString('en-NG', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
              {customer.hasAccount ? (
                <Field
                  label="Last login"
                  value={
                    customer.lastLoginAt
                      ? new Date(customer.lastLoginAt).toLocaleString('en-NG', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Never'
                  }
                />
              ) : null}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Kpi label="Orders" value={String(customer.orderCount)} />
            <Kpi label="Lifetime" value={formatNaira(customer.lifetimeValueKobo)} />
          </div>

          <div className="border border-hairline-soft bg-paper p-5">
            <div className="t-eyebrow text-mute mb-3">Addresses</div>
            {customer.addresses.length === 0 && !customer.lastOrderAddress ? (
              <p className="m-0 t-body-s text-mute">No addresses on file.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {customer.addresses.map((a: UserAddress) => (
                  <AddressBlock
                    key={a._id}
                    title={a.isDefault ? 'Saved, default' : 'Saved'}
                    lines={[a.fullName, a.line1, a.line2, `${a.city}, ${a.state}`, a.phone]}
                  />
                ))}
                {customer.lastOrderAddress ? (
                  <AddressBlock
                    title="Last order delivered to"
                    lines={[
                      customer.lastOrderAddress.fullName,
                      customer.lastOrderAddress.line1,
                      customer.lastOrderAddress.line2,
                      `${customer.lastOrderAddress.city}, ${customer.lastOrderAddress.state}`,
                      customer.lastOrderAddress.phone,
                    ]}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border border-hairline-soft bg-paper">
            <div className="flex items-center justify-between px-5 py-4 border-b border-hairline-soft">
              <div className="t-eyebrow text-mute">Orders</div>
              <div className="text-[12px] uppercase tracking-widest font-medium text-mute">
                {customer.orders.length} total · {customer.paidOrderCount} paid
              </div>
            </div>
            {customer.orders.length === 0 ? (
              <div className="p-6 t-body-s text-mute">No orders yet.</div>
            ) : (
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="text-left border-b border-hairline-soft">
                    <Th>Order</Th>
                    <Th>Placed</Th>
                    <Th>Payment</Th>
                    <Th>Fulfilment</Th>
                    <Th className="text-right">Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((o: AdminCustomerDetailOrder) => (
                    <ClickableRow
                      key={o._id}
                      to={`/orders/${o._id}`}
                      className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                    >
                      <td className="px-4 py-3 font-mono text-[13px] text-ink">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-mute text-[12px]">
                        {new Date(o.createdAt).toLocaleDateString('en-NG', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center text-[11px] uppercase tracking-widest font-medium px-2 py-1',
                            o.paymentStatus === 'paid'
                              ? 'bg-ok/10 text-ok'
                              : o.paymentStatus === 'failed'
                                ? 'bg-blush text-berry'
                                : 'bg-cream-soft text-mute',
                          )}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-graphite capitalize">
                        {o.fulfilmentStatus}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink whitespace-nowrap">
                        {formatNaira(o.totalKobo)}
                      </td>
                    </ClickableRow>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function BackLink() {
  return (
    <Link
      to="/customers"
      className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
    >
      <ArrowLeft size={14} /> Customers
    </Link>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
        {label}
      </dt>
      <dd className="m-0 mt-0.5 text-[14px] text-ink break-all">{value}</dd>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline-soft bg-paper p-4">
      <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
        {label}
      </div>
      <div className="mt-1 font-display italic font-semibold text-[24px] leading-none text-ink">
        {value}
      </div>
    </div>
  )
}

function AddressBlock({ title, lines }: { title: string; lines: (string | undefined)[] }) {
  return (
    <div className="text-[13px] leading-[1.5] text-graphite">
      <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono mb-1">
        {title}
      </div>
      {lines.filter(Boolean).map((l, i) => (
        <div key={i}>{l}</div>
      ))}
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
