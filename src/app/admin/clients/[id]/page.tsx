import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAgentOrAdmin } from '@/lib/session';
import * as clientsCore from '@/lib/admin/clients';
import { AdminError } from '@/lib/admin/errors';
import { STAGE_LABELS, SOURCE_LABELS } from '@/lib/admin/labels';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClientForm } from '../client-form';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireAgentOrAdmin();

  const client = await clientsCore.getClient(id, actor).catch((error) => {
    if (error instanceof AdminError) return null;
    throw error;
  });
  if (!client) notFound();

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-headline text-2xl">
          {client.firstName} {client.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">Client since {client.createdAt.toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
      </div>

      <ClientForm
        clientId={client.id}
        initialValues={{
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone ?? '',
          notes: client.notes ?? '',
        }}
      />

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">Leads ({client.leads.length})</h2>
        <ul className="mt-4 space-y-2">
          {client.leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3 text-sm transition-colors hover:border-primary/40"
              >
                <span>
                  <Badge variant="outline">{STAGE_LABELS[lead.stage] ?? lead.stage}</Badge>
                  <span className="ml-2 text-muted-foreground">{SOURCE_LABELS[lead.source] ?? lead.source}</span>
                </span>
                <time className="font-mono text-xs text-muted-foreground">
                  {lead.createdAt.toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </time>
              </Link>
            </li>
          ))}
          {client.leads.length === 0 ? <p className="text-sm text-muted-foreground">No leads yet.</p> : null}
        </ul>
      </div>
    </div>
  );
}
