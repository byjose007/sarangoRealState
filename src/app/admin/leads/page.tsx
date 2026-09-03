import { requireAgentOrAdmin } from '@/lib/session';
import * as leadsCore from '@/lib/admin/leads';
import { LeadsView } from './leads-view';

export default async function AdminLeadsPage() {
  const actor = await requireAgentOrAdmin();
  const leads = await leadsCore.listLeads(actor);

  return <LeadsView leads={leads} isAdmin={actor.role === 'ADMIN'} />;
}
