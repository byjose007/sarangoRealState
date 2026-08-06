import Link from 'next/link';
import { requireAgentOrAdmin } from '@/lib/session';
import { getDashboardStats } from '@/lib/admin/dashboard';
import { ACTIVITY_ACTION_LABELS, STAGE_LABELS, STAGE_ORDER } from '@/lib/admin/labels';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const user = await requireAgentOrAdmin();
  const stats = await getDashboardStats(user);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {user.email} · <span className="font-mono uppercase">{user.role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Properties" value={stats.propertyCount} href="/admin/properties" />
        <StatTile label="Open leads" value={stats.openLeadCount} href="/admin/leads" />
        <StatTile label="Clients" value={stats.clientCount} href="/admin/clients" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads by stage</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STAGE_ORDER.map((stage) => (
              <div key={stage}>
                <p className="text-2xl tabular-nums">{stats.stageCounts[stage] ?? 0}</p>
                <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                  {STAGE_LABELS[stage]}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {user.role === 'ADMIN' && stats.recentActivity.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {stats.recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-baseline justify-between gap-4 text-sm">
                <p>
                  <span className="text-muted-foreground">{entry.actor?.email ?? 'System'}</span>{' '}
                  {ACTIVITY_ACTION_LABELS[entry.action] ?? entry.action.toLowerCase()}{' '}
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.entityType.toLowerCase()} {entry.entityId.slice(0, 8)}
                  </span>
                </p>
                <time className="shrink-0 font-mono text-xs text-muted-foreground">
                  {entry.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary/40">
        <CardBody>
          <p className="text-3xl tabular-nums">{value}</p>
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
