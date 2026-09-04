import { requireAgentOrAdmin } from '@/lib/session';
import * as clientsCore from '@/lib/admin/clients';
import * as propertiesCore from '@/lib/admin/properties';
import * as agentsCore from '@/lib/admin/agents';
import { NewLeadView } from './new-lead-view';

export default async function NewLeadPage() {
  const actor = await requireAgentOrAdmin();
  const [clients, properties, agents] = await Promise.all([
    clientsCore.listClients(actor),
    propertiesCore.listProperties(actor),
    actor.role === 'ADMIN' ? agentsCore.listAgents(actor) : Promise.resolve(undefined),
  ]);

  return (
    <NewLeadView
      clientOptions={clients.map((client) => ({
        id: client.id,
        label: `${client.firstName} ${client.lastName} (${client.email})`,
      }))}
      propertyOptions={properties.map((property) => ({
        id: property.id,
        label: `${property.title} — ${property.reference}`,
      }))}
      agentOptions={agents?.map((agent) => ({ id: agent.id, label: agent.name }))}
    />
  );
}
