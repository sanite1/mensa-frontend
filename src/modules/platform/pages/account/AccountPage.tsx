// ═══════════════════════════════════════════════════════════════
// /account — minimal account overview stub. Expanded in Sprint 4
// (orders, addresses, preferences). For Sprint 1, it confirms the
// auth flow worked end-to-end.
// ═══════════════════════════════════════════════════════════════
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useGetMe, useLogout } from '@/lib/network/api/auth.api'

export function AccountPage() {
  const storedUser = useAuthStore((s) => s.user)
  const me = useGetMe()
  const logout = useLogout()

  // Prefer the freshest server-side user; fall back to the persisted one.
  const user = me.data?.data?.user ?? storedUser
  if (!user) return null

  return (
    <section className="bg-[var(--paper)] px-6 md:px-12 py-16 md:py-24 max-w-[960px] mx-auto">
      <div className="t-eyebrow text-[var(--mute)] mb-4">Account</div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 72,
          lineHeight: 0.98,
          letterSpacing: '-0.025em',
          color: 'var(--ink)',
        }}
      >
        Hi, {user.name.split(' ')[0]}.
      </h1>
      <p className="t-body-l mt-4 text-[var(--graphite)] max-w-[520px]">
        Manage your orders, addresses, and preferences. Your switch is well underway.
      </p>

      {/* Profile card */}
      <div className="mt-10 border border-[var(--hairline-soft)] bg-[var(--cream-soft)] p-6 md:p-8 grid gap-6 md:grid-cols-2">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phone} />
        <Field label="Account type" value={prettyRole(user.role)} />
      </div>

      {/* Quick actions — stubs for now */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <ActionTile title="Orders" body="Track current and past orders." href="/account/orders" />
        <ActionTile title="Addresses" body="Manage delivery destinations." href="/account/addresses" />
        <ActionTile title="Preferences" body="Email and SMS settings." href="/account/preferences" />
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
      <div className="t-eyebrow text-[var(--mute)] mb-1.5">{label}</div>
      <div className="t-body text-[var(--ink)]">{value}</div>
    </div>
  )
}

function ActionTile({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      to={href}
      className="block border border-[var(--hairline-soft)] bg-[var(--paper)] p-6 hover:border-[var(--ink)] transition-colors no-underline"
    >
      <div className="t-h3 text-[var(--ink)]">{title}</div>
      <p className="t-body-s mt-2 text-[var(--graphite)]">{body}</p>
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
