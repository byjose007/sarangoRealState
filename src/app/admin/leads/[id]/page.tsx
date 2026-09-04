import { notFound } from 'next/navigation';
import { requireAgentOrAdmin } from '@/lib/session';
import * as leadsCore from '@/lib/admin/leads';
import * as agentsCore from '@/lib/admin/agents';
import { AdminError } from '@/lib/admin/errors';
import { LeadDetailView } from './lead-detail-view';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireAgentOrAdmin();

  const lead = await leadsCore.getLead(id, actor).catch((error) => {
    if (error instanceof AdminError) return null;
    throw error;
  });
  if (!lead) notFound();

  const [activity, agentOptions] = await Promise.all([
    leadsCore.getLeadActivity(lead.id),
    actor.role === 'ADMIN' ? agentsCore.listAgents(actor) : Promise.resolve(undefined),
  ]);

  return <LeadDetailView lead={lead} activity={activity} agentOptions={agentOptions} />;
}
