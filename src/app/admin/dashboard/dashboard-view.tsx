'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { STAGE_ORDER, getStageLabel, getActivityActionLabel } from '@/lib/admin/labels';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardViewProps {
  user: {
    email: string;
    role: string;
  };
  stats: {
    propertyCount: number;
    clientCount: number;
    openLeadCount: number;
    stageCounts: Record<string, number>;
    recentActivity: Array<{
      id: string;
      action: string;
      entityType: string;
      entityId: string;
      createdAt: Date;
      actor: { email: string } | null;
    }>;
  };
}

export function DashboardView({ user, stats }: DashboardViewProps) {
  const { t, isEs, language } = useTranslation();

  const roleText =
    user.role === 'ADMIN' ? (isEs ? 'Administrador' : 'Admin') : isEs ? 'Agente' : 'Agent';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl text-headline tracking-tight">
          {t.admin?.dashboard ?? (isEs ? 'Panel de control' : 'Dashboard')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEs ? 'Conectado como' : 'Signed in as'}{' '}
          <span className="font-medium text-foreground">{user.email}</span> ·{' '}
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {roleText}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label={t.admin?.properties ?? (isEs ? 'Propiedades' : 'Properties')}
          value={stats.propertyCount}
          href="/admin/properties"
        />
        <StatTile
          label={t.admin?.openLeads ?? (isEs ? 'Prospectos activos' : 'Open leads')}
          value={stats.openLeadCount}
          href="/admin/leads"
        />
        <StatTile
          label={t.admin?.clients ?? (isEs ? 'Clientes' : 'Clients')}
          value={stats.clientCount}
          href="/admin/clients"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t.admin?.leadsByStage ?? (isEs ? 'Prospectos por etapa' : 'Leads by stage')}
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {STAGE_ORDER.map((stage) => (
              <div key={stage} className="rounded-md border border-border/50 bg-muted/20 p-3">
                <p className="text-2xl font-semibold tabular-nums">
                  {stats.stageCounts[stage] ?? 0}
                </p>
                <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                  {getStageLabel(stage, language)}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {user.role === 'ADMIN' && stats.recentActivity.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {t.admin?.recentActivity ?? (isEs ? 'Actividad reciente' : 'Recent activity')}
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {stats.recentActivity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-3 text-sm last:border-0 last:pb-0"
              >
                <p>
                  <span className="font-medium text-foreground">
                    {entry.actor?.email ?? (isEs ? 'Sistema' : 'System')}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {getActivityActionLabel(entry.action, language)}
                  </span>{' '}
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.entityType.toLowerCase()} {entry.entityId.slice(0, 8)}
                  </span>
                </p>
                <time className="shrink-0 font-mono text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString(isEs ? 'es-EC' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
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
      <Card className="transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
        <CardBody className="p-5">
          <p className="text-3xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
