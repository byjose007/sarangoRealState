import { notFound } from 'next/navigation';
import { requireAgentOrAdmin } from '@/lib/session';
import * as clientsCore from '@/lib/admin/clients';
import { AdminError } from '@/lib/admin/errors';
import { ClientDetailView } from './client-detail-view';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireAgentOrAdmin();

  const client = await clientsCore.getClient(id, actor).catch((error) => {
    if (error instanceof AdminError) return null;
    throw error;
  });
  if (!client) notFound();

  return <ClientDetailView client={client} />;
}
