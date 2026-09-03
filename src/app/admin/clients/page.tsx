import { requireAgentOrAdmin } from '@/lib/session';
import * as clientsCore from '@/lib/admin/clients';
import { ClientsView } from './clients-view';

export default async function AdminClientsPage() {
  const actor = await requireAgentOrAdmin();
  const clients = await clientsCore.listClients(actor);

  return <ClientsView clients={clients} />;
}
