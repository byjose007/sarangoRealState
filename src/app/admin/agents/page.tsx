import { requireAdmin } from '@/lib/session';
import * as agentsCore from '@/lib/admin/agents';
import { AgentsView } from './agents-view';

export default async function AdminAgentsPage() {
  const actor = await requireAdmin();
  const agents = await agentsCore.listAgents(actor);

  return <AgentsView agents={agents} />;
}
