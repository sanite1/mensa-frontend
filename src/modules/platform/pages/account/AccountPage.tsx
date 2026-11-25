// /account, minimal account overview, to be expanded with preferences later.
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useGetMe, useLogout } from '@/lib/network/api/auth.api'
import { useSeo } from '@/lib/seo'
import { AccountCard, AccountShell } from '@/modules/platform/components/AccountShell'

export function AccountPage() {
  useSeo({ title: 'Your account', noindex: true })
  const storedUser = useAuthStore((s) => s.user)
  const me = useGetMe()
  const logout = useLogout()

  // Prefer the freshest server-side user; fall back to the persisted one.
  const user = me.data?.data?.user ?? storedUser
  if (!user) return null

  return (
    <AccountShell
      eyebrow="Account"
      title={<>Hi, {user.name.split(' ')[0]}.</>}
      lede="Manage your orders, addresses, and preferences. Your switch is well underway."
    >
      {/* Profile card */}
      <AccountCard className="grid gap-6 md:grid-cols-2">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phone} />
        <Field label="Account type" value={prettyRole(user.role)} />
      </AccountCard>

      {/* Quick actions */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ActionTile title="Orders" body="Track current and past orders." href="/account/orders" />
        <ActionTile
          title="Addresses"
          body="Manage delivery destinations."
          href="/account/addresses"
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link className="btn" to="/shop">
          Continue shopping
        </Link>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </AccountShell>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="eyebrow">{label}</span>
      <div className="mt-2 text-(--ink)">{value}</div>
    </div>
  )
}

function ActionTile({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      to={href}
      className="ptn-card block no-underline transition-transform duration-300 hover:-translate-y-1"
    >
      <h3 className="text-(length:--fs-lg) text-(--ink)">{title}</h3>
      <p className="mt-2 text-(length:--fs-sm) text-(--mute)">{body}</p>
    </Link>
  )
}

function prettyRole(role: string): string {
  switch (role) {
    case 'customer':
      return 'Customer'
    case 'admin':
      return 'Admin'
    case 'b2b_admin':
      return 'Partnerships · Admin'
    case 'b2b_member':
      return 'Partnerships · Member'
    default:
      return role
  }
}
