// /account, minimal account overview, to be expanded with preferences later.
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useGetMe, useLogout } from '@/lib/network/api/auth.api'
import { useSeo } from '@/lib/seo'

export function AccountPage() {
  useSeo({ title: 'Your account', noindex: true })
  const storedUser = useAuthStore((s) => s.user)
  const me = useGetMe()
  const logout = useLogout()

  // Prefer the freshest server-side user; fall back to the persisted one.
  const user = me.data?.data?.user ?? storedUser
  if (!user) return null

  return (
    <section className="bg-(--paper) px-6 md:px-12 py-16 md:py-24 max-w-240 mx-auto">
      <div className="t-eyebrow text-(--mute) mb-4">Account</div>
      <h1 className="font-display italic font-semibold text-[72px] leading-[0.98] tracking-tight text-ink">
        Hi, {user.name.split(' ')[0]}.
      </h1>
      <p className="t-body-l mt-4 text-(--graphite) max-w-130">
        Manage your orders, addresses, and preferences. Your switch is well underway.
      </p>

      {/* Profile card */}
      <div className="mt-10 border border-(--hairline-soft) bg-(--cream-soft) p-6 md:p-8 grid gap-6 md:grid-cols-2">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phone} />
        <Field label="Account type" value={prettyRole(user.role)} />
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <ActionTile title="Orders" body="Track current and past orders." href="/account/orders" />
        <ActionTile
          title="Addresses"
          body="Manage delivery destinations."
          href="/account/addresses"
        />
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Button asChild variant="primary" size="lg">
          <Link to="/shop">Continue shopping</Link>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="t-eyebrow text-(--mute) mb-1.5">{label}</div>
      <div className="t-body text-(--ink)">{value}</div>
    </div>
  )
}

function ActionTile({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      to={href}
      className="block border border-(--hairline-soft) bg-(--paper) p-6 hover:border-(--ink) transition-colors no-underline"
    >
      <div className="t-h3 text-(--ink)">{title}</div>
      <p className="t-body-s mt-2 text-(--graphite)">{body}</p>
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
