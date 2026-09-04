import { requireAgentOrAdmin } from '@/lib/session';
import * as agentsCore from '@/lib/admin/agents';
import { NewPropertyView } from './new-property-view';

export default async function NewPropertyPage() {
  const actor = await requireAgentOrAdmin();
  const agentOptions = actor.role === 'ADMIN' ? await agentsCore.listAgents(actor) : undefined;

  return <NewPropertyView agentOptions={agentOptions} />;
}
