import { requireAgentOrAdmin } from '@/lib/session';
import * as agentsCore from '@/lib/admin/agents';
import { PropertyForm } from '../property-form';

export default async function NewPropertyPage() {
  const actor = await requireAgentOrAdmin();
  const agentOptions = actor.role === 'ADMIN' ? await agentsCore.listAgents(actor) : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-headline text-2xl">New property</h1>
      <PropertyForm agentOptions={agentOptions} />
    </div>
  );
}
