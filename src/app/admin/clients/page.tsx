import Link from 'next/link';
import { requireAgentOrAdmin } from '@/lib/session';
import * as clientsCore from '@/lib/admin/clients';
import { Button } from '@/components/ui/button';

export default async function AdminClientsPage() {
  const actor = await requireAgentOrAdmin();
  const clients = await clientsCore.listClients(actor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-headline text-2xl">Clients</h1>
        <Link href="/admin/clients/new">
          <Button>New client</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Phone</th>
              <th className="px-4 py-3 font-normal">Added</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${client.id}`} className="font-medium hover:underline">
                    {client.firstName} {client.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3">{client.email}</td>
                <td className="px-4 py-3">{client.phone ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {client.createdAt.toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </td>
              </tr>
            ))}
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No clients yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
