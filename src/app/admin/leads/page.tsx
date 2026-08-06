import Link from 'next/link';
import { requireAgentOrAdmin } from '@/lib/session';
import * as leadsCore from '@/lib/admin/leads';
import { SOURCE_LABELS, STAGE_LABELS, STAGE_ORDER } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { StageSelect } from './stage-select';

export default async function AdminLeadsPage() {
  const actor = await requireAgentOrAdmin();
  const leads = await leadsCore.listLeads(actor);

  const columns = STAGE_ORDER.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stage === stage),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-headline text-2xl">Leads</h1>
        <Link href="/admin/leads/new">
          <Button>New lead</Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.stage} className="w-72 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                {STAGE_LABELS[column.stage]}
              </p>
              <span className="font-mono text-xs text-muted-foreground">{column.leads.length}</span>
            </div>
            <div className="space-y-3">
              {column.leads.map((lead) => (
                <div key={lead.id} className="rounded-md border border-border bg-card p-3">
                  <Link href={`/admin/leads/${lead.id}`} className="block">
                    <p className="font-medium hover:underline">
                      {lead.client.firstName} {lead.client.lastName}
                    </p>
                    {lead.property ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{lead.property.title}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">{SOURCE_LABELS[lead.source] ?? lead.source}</p>
                    {actor.role === 'ADMIN' && lead.assignedAgent ? (
                      <p className="mt-1 text-xs text-muted-foreground">Agent: {lead.assignedAgent.name}</p>
                    ) : null}
                  </Link>
                  <div className="mt-2">
                    <StageSelect leadId={lead.id} stage={lead.stage} className="h-9 text-xs" />
                  </div>
                </div>
              ))}
              {column.leads.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Empty
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
