// ═══════════════════════════════════════════════════════════════
// /  (admin dashboard) — Sprint 1 stub. Real KPI cards land in
// Sprint 4 (Admin dashboard sprint).
// ═══════════════════════════════════════════════════════════════
import { useAuthStore } from '@/lib/network/stores/auth.store'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-300">
      <div className="t-eyebrow text-mute mb-3">Dashboard</div>
      <h1 className="m-0 font-display italic font-semibold text-[clamp(36px,6vw,56px)] leading-[1.02] tracking-tight text-ink">
        Hi, {user.name.split(' ')[0]}.
      </h1>
      <p className="t-body-l mt-3 text-graphite max-w-140">
        Welcome to the Mensa admin. The full KPI overview ships in Sprint 4. For now this is the
        landing surface for authenticated admin sessions.
      </p>

      {/* Placeholder cards mirroring the real layout that comes next sprint. */}
      <div className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard label="Today's orders" value="0" />
        <KpiCard label="Revenue (this week)" value="0" />
        <KpiCard label="Pending fulfilment" value="0" />
        <KpiCard label="Low stock SKUs" value="0" />
      </div>

      <div className="mt-8 md:mt-10 border border-hairline-soft bg-paper p-4 md:p-6">
        <div className="t-eyebrow text-mute mb-3">In development</div>
        <p className="t-body text-graphite">
          The sidebar links are scaffolded but the destinations live in later sprints. Sprint 2
          brings <strong>Products</strong>. Sprint 3 brings <strong>Orders + Checkout</strong>.
          Sprint 4 wraps the rest of this dashboard.
        </p>
      </div>
    </section>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline-soft bg-paper p-4 md:p-5">
      <div className="t-eyebrow text-mute text-[10.5px]">{label}</div>
      <div className="mt-2 text-ink font-display italic font-semibold text-[clamp(28px,4vw,36px)] leading-none tracking-[-0.02em]">
        {value}
      </div>
    </div>
  )
}
