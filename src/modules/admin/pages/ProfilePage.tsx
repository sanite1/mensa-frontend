// /profile (admin) — the signed in admin's account details.
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useLogout } from '@/lib/network/api/auth.api'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-3xl">
      <div className="t-eyebrow text-mute mb-3">Account</div>
      <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
        Profile
      </h1>

      <div className="mt-8 border border-hairline-soft bg-paper p-5 md:p-7">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center h-14 w-14 bg-ink text-paper font-medium text-[18px] tracking-[0.04em]">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="text-[18px] font-medium text-ink truncate">{user.name}</div>
            <div className="t-body-s text-mute truncate">{user.email}</div>
          </div>
        </div>

        <dl className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <ProfileRow label="Role" value="Administrator" />
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow label="Name" value={user.name} />
          <ProfileRow label="Access" value="Full admin console" />
        </dl>

        <div className="mt-8 pt-5 border-t border-hairline-soft flex items-center justify-between gap-4 flex-wrap">
          <p className="m-0 t-body-s text-mute max-w-90">
            To change your name, email or password, contact the team at hi@mensaproducts.com.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut size={14} strokeWidth={1.6} />
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </div>
    </section>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="t-eyebrow text-mute text-[10.5px]">{label}</dt>
      <dd className="m-0 mt-1.5 text-[14.5px] text-ink">{value}</dd>
    </div>
  )
}
