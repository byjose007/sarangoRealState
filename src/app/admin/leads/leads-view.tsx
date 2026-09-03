'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { STAGE_ORDER, getStageLabel, getSourceLabel } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { StageSelect } from './stage-select';

interface LeadItem {
  id: string;
  stage: string;
  source: string;
  client: { firstName: string; lastName: string };
  property?: { title: string } | null;
  assignedAgent?: { name: string } | null;
}

export function LeadsView({ leads, isAdmin }: { leads: LeadItem[]; isAdmin: boolean }) {
  const { t, isEs, language } = useTranslation();

  const columns = STAGE_ORDER.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stage === stage),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl text-headline tracking-tight">
          {t.admin?.leads ?? (isEs ? 'Prospectos' : 'Leads')}
        </h1>
        <Link href="/admin/leads/new">
          <Button>{t.admin?.newLead ?? (isEs ? 'Nuevo prospecto' : 'New lead')}</Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.stage} className="w-72 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                {getStageLabel(column.stage, language)}
              </p>
              <span className="font-mono text-xs text-muted-foreground">{column.leads.length}</span>
            </div>
            <div className="space-y-3">
              {column.leads.map((lead) => (
                <div
                  key={lead.id}
                  className="shadow-xs rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/30"
                >
                  <Link href={`/admin/leads/${lead.id}`} className="block">
                    <p className="font-medium hover:underline">
                      {lead.client.firstName} {lead.client.lastName}
                    </p>
                    {lead.property ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {lead.property.title}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getSourceLabel(lead.source, language)}
                    </p>
                    {isAdmin && lead.assignedAgent ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isEs ? 'Agente' : 'Agent'}: {lead.assignedAgent.name}
                      </p>
                    ) : null}
                  </Link>
                  <div className="mt-2">
                    <StageSelect leadId={lead.id} stage={lead.stage} className="h-9 text-xs" />
                  </div>
                </div>
              ))}
              {column.leads.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  {isEs ? 'Vacío' : 'Empty'}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
