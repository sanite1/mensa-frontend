// /customers/:id (admin).

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

import {
  useAdminCustomer,
  type AdminCustomerDetailOrder,
} from '@/lib/network/api/admin.api'
import type { UserAddress } from '@/lib/network/types/user.types'
import { formatNaira } from '@/lib/utils'

const ROLE_LABEL: Record<string, string> = {
  customer: 'Customer',
  admin: 'Admin',
  b2b_admin: 'B2B admin',
  b2b_member: 'B2B member',
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAdminCustomer(id)
  const customer = query.data?.data?.customer

  if (query.isLoading) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10 t-body-s text-mute">Loading…</section>
    )
  }

  if (query.isError || !customer) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
        >
          <ArrowLeft size={14} /> Customers
        </Link>
        <p className="t-body text-err">We could not load that customer.</p>
      </section>
    )
  }

  const verified = customer.emailVerified

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Link
        to="/customers"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
      >
        <ArrowLeft size={14} /> Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="t-eyebrow text-mute mb-3">Profile</div>
            <h1 className="m-0 font-display italic font-semibold text-[28px] leading-tight tracking-tight text-ink">
              {customer.name}
            </h1>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest font-medium">
              {verified ? (
                <>
                  <CheckCircle2 size={14} className="text-ok" />
                  <span className="text-ok">Verified</span>
                </>
              ) : (
                <>
                  <XCircle size={14} className="text-mute" />
                  <span className="text-mute">Unverified</span>
                </>
              )}
            </div>

            <dl className="mt-5 space-y-3 text-[14px]">
              <Field label="Email" value={customer.email} />
              <Field label="Phone" value={customer.phone} />
              <Field label="Role" value={ROLE_LABEL[customer.role] ?? customer.role} />
              <Field
                label="Joined"
                value={new Date(customer.createdAt).toLocaleDateString('en-NG', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
              <Field
                label="Last login"
                value={
                  customer.lastLoginAt
                    ? new Date(customer.lastLoginAt).toLocaleString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'
                }
              />
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Kpi label="Orders" value={String(customer.orderCount)} />
            <Kpi label="Lifetime" value={formatNaira(customer.lifetimeValueKobo)} />
          </div>

          {/* Addresses */}
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="t-eyebrow text-mute mb-3">Saved addresses</div>
            {customer.addresses.length === 0 ? (
              <p className="t-body-s text-mute">No saved addresses.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {customer.addresses.map((a: UserAddress) => (
                  <li key={a._id} className="text-[13px] text-graphite">
                    {a.label ? (
                      <div className="text-[11px] uppercase tracking-widest font-medium text-mute mb-1">
                        {a.label}
                        {a.isDefault ? ' · Default' : ''}
                      </div>
                    ) : null}
                    <div className="text-ink">{a.fullName}</div>
                    <div>
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ''}
                    </div>
                    <div>
                      {a.city}, {a.state}
                    </div>
                    <div className="text-mute">{a.phone}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="border border-hairline-soft bg-paper">
            <div className="flex items-center justify-between px-5 py-4 border-b border-hairline-soft">
              <div className="t-eyebrow text-mute">Orders</div>
              <div className="text-[11px] uppercase tracking-widest font-medium text-mute">
                {customer.orders.length} total
              </div>
            </div>
            {customer.orders.length === 0 ? (
              <div className="p-6 t-body-s text-mute">No orders yet.</div>
            ) : (
              <ul className="divide-y divide-hairline-soft">
                {customer.orders.map((o: AdminCustomerDetailOrder) => (
                  <li key={o._id}>
                    <Link
                      to={`/orders/${o._id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cream-soft no-underline"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-mono text-ink">{o.orderNumber}</div>
                        <div className="text-[11px] uppercase tracking-widest font-medium text-mute">
                          {o.paymentStatus} · {o.fulfilmentStatus}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-medium text-ink">
                          {formatNaira(o.totalKobo)}
                        </div>
                        <div className="text-[11px] uppercase tracking-widest font-medium text-mute">
                          {new Date(o.createdAt).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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
      <div className="mt-1 text-ink font-display italic font-semibold text-[24px] leading-none tracking-tight">
        {value}
      </div>
    </div>
  )
}
